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
import { CookieService } from './cookie';
import { PublicTokenData } from '@/interfaces/token';

export class AuthServices {
    private googleService: GoogleServices;
    private tokenService: AuthTokenService;

    constructor() {
        this.googleService = new GoogleServices();
        this.tokenService = new AuthTokenService();
    }

    @handleServiceError('Google login failed')
    async googleLogin(IdToken: string, res: Response): Promise<AuthResponse> {
        const googleTokenPayload = await this.googleService.verifyGoogleToken(IdToken);

        let user = await UserService.findUser({ email: googleTokenPayload.email });
        const isNewUser = !user;

        if (!user) { // Registering the new Google account
            const {
                given_name,
                family_name,
                email,
                picture,
                google_id
            } = googleTokenPayload;

            const username = await UserService.generateUsername(given_name, family_name);

            user = await UserService.createUser({
                username: username,
                email: email,
                authProvider: AuthProvider.GOOGLE,
                lastLogin: new Date(),
                googleId: google_id,
                isActive: true,
                profilePicture: picture
            });
            
        } else {
            if (!user.compareGoogleId(googleTokenPayload.google_id)) {
                throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
            }

            if (!user.get('isActive')) {
                throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
            }

            await userRespository.saveUserChanges({ lastLogin: new Date() }, user);
        }

        const accessToken = this.tokenService.generateAccessToken(user.get('id'), isNewUser);
        const refreshToken = this.tokenService.generateRefreshToken(user.get('id'));   

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return {
            token: accessToken,
            firstAuth: isNewUser,
            user: UserService.getUserPublicData(user)
        };
    }

    @handleServiceError('Login failed')
    async login(data: loginDto, res: Response): Promise<AuthResponse> {
        const { email, password } = data;

        const user = await UserService.findUser({ email });
        if (!user) {
            throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
        }

        if (!user.get('isActive')) {
            throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
        }

        if (user.get('authProvider') !== AuthProvider.LOCAL) {
            throw new AppError(`Please use ${user.get('authProvider')} login for this account`, 403, ErrorTypes.UNAUTHORIZED);
        }

        const isPasswordValid = await user.comparePasswords(password);
        if(!isPasswordValid){
            throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
        }

        await UserService.saveUserChanges({ lastLogin: new Date() }, user);

        const accessToken = this.tokenService.generateAccessToken(user.get('id'));
        const refreshToken = this.tokenService.generateRefreshToken(user.get('id'));   

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return {
            token: accessToken,
            user: UserService.getUserPublicData(user)
        };
    }

    @handleServiceError('Registration failed')
    async register(data: registerDto, res: Response): Promise<AuthResponse> {
        const { username, email, password } = data;

        await UserService.validateNewUserCredentials(email, username);
            
        const newUser = await UserService.createUser({
            username: username,
            email: email,
            password: password,
            authProvider: AuthProvider.LOCAL,
            lastLogin: new Date(),
            isActive: true,
        });
        
        const accessToken = this.tokenService.generateAccessToken(newUser.get('id'), true);
        const refreshToken = this.tokenService.generateRefreshToken(newUser.get('id'));

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return {
            token: accessToken,
            firstAuth: true,
            user: UserService.getUserPublicData(newUser)
        };
    }

    @handleServiceError('Logout failed')
    async logout(res: Response): Promise<void> {
        CookieService.clearRefreshToken(res);
    }

    // refreshing user tokens
    @handleServiceError('Token refresh failed')
    async refreshToken(req: Request, res: Response): Promise<PublicTokenData> {
        const token = req.cookies.refreshToken;

        if(!token){
            CookieService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        // extract the user id from the refresh token
        const decodedToken = this.tokenService.decodeRefreshToken(token) ;
    
        if(!decodedToken){
            CookieService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await UserService.findUser({ id: decodedToken.user_id });

        if (!user) {
            CookieService.clearRefreshToken(res);
            throw new AppError('User not found', 401 , ErrorTypes.UNAUTHORIZED);
        }

        const accessToken = this.tokenService.generateAccessToken(user.get('id'), true);
        const refreshToken = this.tokenService.generateRefreshToken(user.get('id'));

        CookieService.setRefreshToken(refreshToken.token, refreshToken.expiresIn, res);

        return accessToken;
    }

    @handleServiceError('Auth check failed')
    async checkAuth(req: Request, res: Response): Promise<AuthResponse> {
        const decodedToken = this.tokenService.decodeRefreshToken(req.cookies.refreshToken);

        if (!decodedToken) {
            CookieService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await UserService.findUser({ id: decodedToken.user_id });
    
        if (!user) {
            CookieService.clearRefreshToken(res);
            throw new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED);
        }

        return {
            token: this.tokenService.generateAccessToken(user.get('id')),
            user: UserService.getUserPublicData(user)
        };
    }
}