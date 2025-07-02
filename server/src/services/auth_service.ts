import {
    loginDto,
    registerDto,
    AuthResponse,
    UserData,
    TokenPayload,
    AuthProvider,
} from '../interfaces/auth_interfaces';
import { User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { config } from 'dotenv'
import { TokenServices } from './token_service';
import { GoogleServices } from './google_services';
import { UserServices } from './user_service';
import { AppError } from '../middleware/error_middleware';
import { ErrorTypes } from '../interfaces/error_interface';

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

    async googleLogin(IdToken: string, res: Response, next: NextFunction): Promise<AuthResponse | void> {
        const TokenPayload = await this.googleServices.verifyGoogleToken(IdToken);

        let user = await User.findOne({ where: { email: TokenPayload.email }});

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
        }
        else {
            if (!user.get('isActive')) {
                return next( new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED));
            }

            if(!user.compareGoogleId(TokenPayload.google_id)) {
                return next( new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS));
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
            success: true,
            message: 'Login successfully',
            data: {
                user: user.safeUser() as UserData,
                token: accessToken
            }
        };
    }

    async login(data: loginDto, res: Response, next: NextFunction): Promise<AuthResponse | void> {
        const { email, password } = data;

        const user = await User.findOne({ where: { email }});
        if (!user) {
            return next( new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS));
        }

        if (!user.get('isActive')) {
            return next( new AppError(`This account is inactive. Please contact support.`, 403, ErrorTypes.ACCOUNT_LOCKED));
        }

        if (user.get('authProvider') !== 'local') {
            return next( new AppError(`Please use ${user.get('authProvider')} login for this account`, 403, ErrorTypes.UNAUTHORIZED));
        }

        const isPasswordValid = await user.comparePasswords(password);
        if(!isPasswordValid){
            return next( new AppError('Invalid credentials', 401, ErrorTypes.INVALID_CREDENTIALS));
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
            success: true,
            message: 'Login successfully',
            data: {
                user: user.safeUser() as UserData,
                token: accessToken
            }
        };
    }

    async register(data: registerDto, res: Response, next: NextFunction): Promise<AuthResponse | void> {
        const { username, email, password } = data;

        // verifying if the email is used
        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            return next( new AppError('Email already exists', 409, ErrorTypes.VALIDATION_ERR, {
                email: 'Email is already registered'
            }));
        }

        // verifying if the username is used
        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername) {
            return next( new AppError('Username is already taken', 409, ErrorTypes.VALIDATION_ERR, {
                username: 'Username is already taken'
            }));
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
            success: true,
            message: 'User registered successfully',
            data: {
                user: newUser.safeUser() as UserData,
                token: accessToken,
                firstAuth: true
            }
        };
    }

    async logout(user: UserData, res: Response, next: NextFunction): Promise<AuthResponse | void> {
        const userToLogout = await User.findOne({ where: { email: user.email } });
        if (!userToLogout) {
            return next(new AppError('User not found', 404, ErrorTypes.NOT_FOUND));
        }

        await User.update({
            refreshToken: null,
        }, {
            where: { 
                id: userToLogout.get('id')
            },
        })

        res.clearCookie('refreshToken');

        return {
            success: true,
            message: 'Logout successfully'
        };
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<AuthResponse | void> { // refreshing user tokens
        // extract the user id from the refresh token
        const decodedToken = this.tokenServices.getDecodedToken(req) as TokenPayload;

        if(!decodedToken){
            res.clearCookie('refreshToken');
            return next(new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN));
        }

        const user = await User.findOne({
            where: {
                id: decodedToken.id,
            }
        })

        if (!user) {
            res.clearCookie('refreshToken');
            return next(new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED));
        }

        const accessToken = await this.tokenServices.setTokens(user, res);

        return {
            success: true,
            message: 'Refreshed Tokens successfully',
            data: {
                user: user.safeUser() as UserData,
                token: accessToken
            }
        };
    }

    async checkAuth(req: Request, res: Response, next: NextFunction): Promise<AuthResponse | void> {
        const decodedToken = this.tokenServices.getDecodedToken(req) as TokenPayload;

        if (!decodedToken) {
            return next(new AppError('Session ended', 404, ErrorTypes.MISSING_TOKEN));
        }

        const user = await User.findOne({
            where: {
                id: decodedToken.id,
            }
        });

        if (!user) {
            return next(new AppError('User not found', 404, ErrorTypes.UNAUTHORIZED));
        }

        return {
            success: true,
            message: 'User is authenticated',
            data: {
                user: user.safeUser() as UserData
            }
        };
    }
}