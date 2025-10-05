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
import { TokenService } from './token';
import { GoogleServices } from './google';
import { UserService } from './user';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error';
import userRespository from '../repositories/user';

config()

export class AuthServices {
    private googleService: GoogleServices;
    private tokenService: TokenService;

    constructor() {
        this.googleService = new GoogleServices();
        this.tokenService = new TokenService();
    }

    async googleLogin(IdToken: string, res: Response, next: NextFunction): Promise<AuthResponse> {
        try {
            const TokenPayload = await this.googleService.verifyGoogleToken(IdToken);

            let user = await UserService.findUser({ email: TokenPayload.email });
            const isNewUser = !user;

            if (!user) { // Registering the new Google account
                const {
                    given_name,
                    family_name,
                    email,
                    picture,
                    google_id
                } = TokenPayload;

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
                if (!user.compareGoogleId(TokenPayload.google_id)) {
                    throw new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS);
                }

                if (!user.get('isActive')) {
                    throw new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED);
                }

                await userRespository.saveUserChanges({ lastLogin: new Date() }, user);
            }

            const accessToken = await this.tokenService.setTokens(user, res);

            return {
                token: accessToken,
                firstAuth: isNewUser
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                // Unexpected errors
                throw new AppError('Google login failed', 500, ErrorTypes.INTERNAL_ERR, error);
            }
        }
    }

    async login(data: loginDto, res: Response): Promise<AuthResponse> {
        try {
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
    
            const accessToken = await this.tokenService.setTokens(user, res);
    
            return {
                token: accessToken
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                // Unexpected errors
                throw new AppError('Login failed', 500, ErrorTypes.INTERNAL_ERR, error);
            }
        }

    }

    async register(data: registerDto, res: Response): Promise<AuthResponse> {
        try {
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
            
            const accessToken = await this.tokenService.setTokens(newUser, res);
    
            return {
                token: accessToken,
                firstAuth: true
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                // Unexpected errors
                throw new AppError('Registration failed', 500, ErrorTypes.INTERNAL_ERR, error);
            }
        }
    }

    async logout(user: User, res: Response): Promise<void> {
        try {
            await UserService.saveUserChanges({ refreshToken: null }, user);
            this.tokenService.clearRefreshToken(res);
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                // Unexpected errors
                throw new AppError('Logout failed', 500, ErrorTypes.INTERNAL_ERR, error);
            }
        }
    }

    // refreshing user tokens
    async refreshToken(req: Request, res: Response): Promise<PublicTokenData> { 
        try {
            // extract the user id from the refresh token
            const decodedToken = this.tokenService.getDecodedRefreshToken(req) as TokenPayload;
    
            if(!decodedToken){
                this.tokenService.clearRefreshToken(res);
                throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
            }
    
            const user = await UserService.findUser({ id: decodedToken.id });
    
            if (!user) {
                this.tokenService.clearRefreshToken(res);
                throw new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED);
            }
    
            return await this.tokenService.setTokens(user, res);
        } catch (error) {
            if (error instanceof AppError) {
                throw error
            } else {
                // Unexpected errors
                throw new AppError('Tokens refresh failed!', 500, ErrorTypes.INTERNAL_ERR, error);
            }
        }
    }

    async checkAuth(req: Request, res: Response): Promise<PublicTokenData> {
        const decodedToken = this.tokenService.getDecodedRefreshToken(req) as TokenPayload;

        if (!decodedToken) {
            this.tokenService.clearRefreshToken(res);
            throw new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN);
        }

        const user = await UserService.findUser({ id: decodedToken.id });
    
        if (!user) {
            this.tokenService.clearRefreshToken(res);
            throw new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED);
        }

        return this.tokenService.generateAccessToken(user);
    }
}