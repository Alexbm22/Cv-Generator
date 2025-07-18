import {
    loginDto,
    registerDto,
    AuthResponse,
    TokenPayload,
    AuthProvider,
    PublicTokenData,
} from '../interfaces/auth';
import { User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { config } from 'dotenv'
import { TokenServices } from './token';
import { GoogleServices } from './google';
import { UserServices } from './user';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';

config()

export class AuthServices {
    private googleServices: GoogleServices;
    private userServices: UserServices;
    private tokenServices: TokenServices;

    constructor() {
        this.googleServices = new GoogleServices();
        this.userServices = new UserServices();
        this.tokenServices = new TokenServices();
    }

    async googleLogin(IdToken: string, res: Response, next: NextFunction): Promise<AuthResponse> {
        const TokenPayload = await this.googleServices.verifyGoogleToken(IdToken);

        let user = await User.findOne({ where: { email: TokenPayload.email }});
        const isNewUser = !user;

        if (!user) { // Registering the new Google account
            const {
                given_name,
                family_name,
                email,
                picture,
                google_id
            } = TokenPayload;

            const username = await this.userServices.generateUsername(given_name, family_name)

            user = await User.create({
                username: username,
                email: email,
                authProvider: AuthProvider.GOOGLE,
                lastLogin: new Date(),
                googleId: google_id,
                isActive: true,
                profilePicture: picture
            });
            
        } else {
            if (!user.get('isActive')) {
                throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
            }

            if(!user.compareGoogleId(TokenPayload.google_id)) {
                throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
            }

            await User.update({
                    lastLogin: new Date(),
                }, {
                    where: { 
                        id: user.id
                },
            });
        }

        const accessToken = await this.tokenServices.setTokens(user, res); 

        return {
            token: accessToken,
            firstAuth: isNewUser
        };
    }

    async login(data: loginDto, res: Response): Promise<AuthResponse> {
        const { email, password } = data;

        const user = await User.findOne({ where: { email }});
        if (!user) {
            throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
        }

        if (!user.get('isActive')) {
            throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
        }

        if (user.get('authProvider') !== 'local') {
            throw new AppError(`Please use ${user.get('authProvider')} login for this account`, 403, ErrorTypes.UNAUTHORIZED);
        }

        const isPasswordValid = await user.comparePasswords(password);
        if(!isPasswordValid){
            throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
        }

        await User.update({
            lastLogin: new Date(),
        }, {
            where: { 
                id: user.id
            },
        });

        const accessToken = await this.tokenServices.setTokens(user, res);

        return {
            token: accessToken
        };
    }

    async register(data: registerDto, res: Response): Promise<AuthResponse> {
        const { username, email, password } = data;

        // verifying if the email is used
        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            throw new AppError('Email already exists', 409, ErrorTypes.VALIDATION_ERR, {
                email: 'Email is already registered'
            });
        }

        // verifying if the username is used
        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername) {
            throw new AppError('Username is already taken', 409, ErrorTypes.VALIDATION_ERR, {
                username: 'Username is already taken'
            });
        }
        
        const newUser = await User.create({
            username: username,
            email: email,
            password: password,
            authProvider: AuthProvider.LOCAL,
            lastLogin: new Date(),
            isActive: true,
        });
        
        const accessToken = await this.tokenServices.setTokens(newUser, res);

        return {
            token: accessToken,
            firstAuth: true
        };
    }

    async logout(user: User, res: Response): Promise<void> {
        await User.update({
            refreshToken: null,
        }, {
            where: { 
                id: user.get('id')
            },
        })

        res.clearCookie('refreshToken');
    }

    async refreshToken(req: Request, res: Response): Promise<AuthResponse> { // refreshing user tokens
        // extract the user id from the refresh token
        const decodedToken = this.tokenServices.getDecodedToken(req) as TokenPayload;

        if(!decodedToken){
            res.clearCookie('refreshToken');
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await User.findOne({
            where: {
                id: decodedToken.id,
            }
        })

        if (!user) {
            res.clearCookie('refreshToken');
            throw new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED);
        }

        const accessToken = await this.tokenServices.setTokens(user, res);

        return {
            token: accessToken
        };
    }

    async checkAuth(req: Request, res: Response): Promise<PublicTokenData> {
        const decodedToken = this.tokenServices.getDecodedToken(req) as TokenPayload;

        if (!decodedToken) {
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await User.findOne({
            where: {
                id: decodedToken.id,
            }
        });
        if (!user) {
            throw new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED);
        }

        return this.tokenServices.generateAccessToken(user);
    }
}