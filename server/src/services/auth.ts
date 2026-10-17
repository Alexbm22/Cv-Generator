import {
    loginDto,
    registerDto,
    AuthResponse,
    AuthProvider,
} from '../interfaces/auth'
import { Response, Request } from 'express';
import { GoogleServices } from './google';
import { UserService } from './user';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import userRespository from '../repositories/user';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { AuthTokenService } from './tokens';
import { CookieService, REFRESH_COOKIE_NAME } from './cookie';
import { PublicTokenData } from '@/interfaces/token';
import { MediaFilesServices } from './mediaFiles';
import { MediaType, MimeType, OwnerType } from '@/interfaces/mediaFiles';
import { PasswordHasher } from '@/utils/passwordHasher';
import { UniqueConstraintError } from 'sequelize';
import sequelize from '@/config/DB/database_config';
import { User } from '@/models';
import { attachStripeCustomer, createInitialCredits } from '@/models/user';
import { Actor } from '@/interfaces/actor';
import { ServerUserAttributes } from '@/interfaces/user';

// Converts the guest row in place, so the same user id keeps any data already attached to it.
const upgradeGuestToRegistered = async (guest: User, updates: Partial<ServerUserAttributes>): Promise<User> => {
    try {
        await sequelize.transaction(async transaction => {
            guest.set({
                ...updates,
                type: 'registered',
                convertedAt: new Date(),
                guestTokenHash: null,
            });
            await guest.save({ transaction });
            await createInitialCredits(guest.get('id'), transaction);
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            throw new AppError('Validation failed', 409, ErrorTypes.VALIDATION_ERR, {
                email: 'Email or username is already taken',
            });
        }
        throw error;
    }

    await attachStripeCustomer(guest);
    return guest;
};

export class AuthServices {
    private googleService: GoogleServices;
    private tokenService: AuthTokenService;

    constructor() {
        this.googleService = new GoogleServices();
        this.tokenService = new AuthTokenService();
    }

    @handleServiceError('Google login failed')
    async googleLogin(IdToken: string, res: Response, actor?: Actor): Promise<AuthResponse> {
        const googleTokenPayload = await this.googleService.verifyGoogleToken(IdToken);

        let user = await UserService.getUserWithMediaFile({ email: googleTokenPayload.email, type: 'registered' });
        const isNewUser = !user;

        if (!user) {
            // Registering the new Google account
            const {
                given_name,
                family_name,
                email,
                picture,
                google_id
            } = googleTokenPayload;

            const username = await UserService.generateUsername(given_name, family_name);
 
            const guest = actor?.type === 'guest' ? await UserService.getUser({ id: actor.id, type: 'guest' }) : null;
            const accountFields = {
                lastLogin: new Date(),
                isActive: true,
                needsInitialSync: true,
                authProvider: 'google' as const,
            };

            user = guest
                ? await upgradeGuestToRegistered(guest, {
                    ...accountFields,
                    username,
                    email,
                    googleId: guest.hashGoogleId(google_id),
                })
                : await UserService.createUser({
                    ...accountFields,
                    type: 'registered',
                    username,
                    email,
                    googleId: google_id,
                });

            const mediaFile =await MediaFilesServices.create({
                user_id: user.id,
                owner_id: user.id,
                filename: user.get('username') as string,
                owner_type: OwnerType.USER,
                mime_type: MimeType.IMAGE_PNG,
                type: MediaType.PROFILE_PHOTO,
                is_active: true,
            });

            await this.googleService.uploadGoogleProfilePicture(mediaFile.id, picture);

            user = await UserService.getUserWithMediaFile({ id: user.id });
        } else {
            if (!user.compareGoogleId(googleTokenPayload.google_id)) {
                throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
            }

            if (!user.get('isActive')) {
                throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
            }

            await userRespository.saveUserChanges({ lastLogin: new Date() }, user);
        }

        if (!user) {
            throw new AppError('User not found', 500, ErrorTypes.UNAUTHORIZED);
        }

        CookieService.clearGuestToken(res);

        const accessToken = this.tokenService.generateAccessToken(user.get('id'), user.get('tokenVersion'), isNewUser);
        const refreshToken = this.tokenService.generateRefreshToken(user.get('id'), user.get('tokenVersion'));   

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return {
            token: accessToken,
            user: await UserService.getUserPublicData(user)
        };
    }

    @handleServiceError('Login failed')
    async login(data: loginDto, res: Response): Promise<AuthResponse> {
        const { email, password } = data;

        const user = await UserService.getUserWithMediaFile({ email, type: 'registered' });
        if (!user) {
            throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
        }

        if (!user.get('isActive')) {
            throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
        }

        const isPasswordValid = await user.comparePasswords(password);
        if(!isPasswordValid){
            throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
        }

        const passwordHash = user.get('password');
        if (passwordHash && PasswordHasher.needsRehash(passwordHash)) {
            const rehashedPassword = await PasswordHasher.hash(password);
            await userRespository.updateUserByFields({ password: rehashedPassword }, { id: user.get('id') });
        }

        await UserService.saveUserChanges({ lastLogin: new Date() }, user);
        CookieService.clearGuestToken(res);

        const accessToken = this.tokenService.generateAccessToken(user.get('id'), user.get('tokenVersion'));
        const refreshToken = this.tokenService.generateRefreshToken(user.get('id'), user.get('tokenVersion'));   

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return {
            token: accessToken,
            user: await UserService.getUserPublicData(user)
        };
    }

    @handleServiceError('Registration failed')
    async register(data: registerDto, actor: Actor | undefined, res: Response): Promise<AuthResponse> {
        const { username, email, password } = data;

        await UserService.validateNewUserCredentials(email, username);
            
        const guest = actor?.type === 'guest' ? await UserService.getUser({ id: actor.id, type: 'guest' }) : null;
        const accountFields = {
            lastLogin: new Date(),
            isActive: true,
            needsInitialSync: true,
            authProvider: 'local' as const,
        };

        const user = guest
            ? await upgradeGuestToRegistered(guest, {
                ...accountFields,
                username,
                email,
                password: await PasswordHasher.hash(password),
            })
            : await UserService.createUser({
                ...accountFields,
                type: 'registered',
                username,
                email,
                password,
            });

        await MediaFilesServices.create({
            user_id: user.id,
            owner_id: user.id,
            filename: user.get('username') as string,
            owner_type: OwnerType.USER,
            mime_type: MimeType.IMAGE_PNG,
            type: MediaType.PROFILE_PHOTO,
            is_active: false,
        });
        
        CookieService.clearGuestToken(res);

        return {
            message: 'User registered successfully'
        };
    }

    @handleServiceError('Logout failed')
    async logout(req: Request, res: Response): Promise<void> {
        CookieService.clearRefreshToken(res);

        const token = req.cookies?.[REFRESH_COOKIE_NAME];
        if (typeof token !== 'string') {
            return;
        }

        const decodedToken = this.tokenService.decodeRefreshToken(token);
        if (!decodedToken) {
            return;
        }

        await userRespository.updateUserByFields(
            { tokenVersion: decodedToken.version + 1 },
            { id: decodedToken.user_id, tokenVersion: decodedToken.version },
        );
    }

    // refreshing user tokens
    @handleServiceError('Token refresh failed')
    async refreshToken(req: Request, res: Response): Promise<PublicTokenData> {
        const token = req.cookies?.[REFRESH_COOKIE_NAME];

        if(typeof token !== 'string'){
            CookieService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        // extract the user id from the refresh token
        const decodedToken = this.tokenService.decodeRefreshToken(token) ;
    
        if(!decodedToken){
            CookieService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await UserService.getUser({ id: decodedToken.user_id, tokenVersion: decodedToken.version });

        if (!user) {
            CookieService.clearRefreshToken(res);
            throw new AppError('User not found', 401 , ErrorTypes.UNAUTHORIZED);
        }

        const accessToken = this.tokenService.generateAccessToken(user.get('id'), user.get('tokenVersion'), true);
        const refreshToken = this.tokenService.generateRefreshToken(user.get('id'), user.get('tokenVersion'));

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return accessToken;
    }

    @handleServiceError('Auth check failed')
    async checkAuth(req: Request, res: Response): Promise<AuthResponse> {
        const token = req.cookies?.[REFRESH_COOKIE_NAME];
        const decodedToken = typeof token === 'string'
            ? this.tokenService.decodeRefreshToken(token)
            : null;

        if (!decodedToken) {
            CookieService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await UserService.getUserWithMediaFile({ id: decodedToken.user_id, tokenVersion: decodedToken.version });
    
        if (!user) {
            CookieService.clearRefreshToken(res);
            throw new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED);
        }

        return {
            token: this.tokenService.generateAccessToken(user.get('id'), user.get('tokenVersion')),
            user: await UserService.getUserPublicData(user)
        };
    }
}