import {
    loginDto,
    registerDto,
    AuthResponse,
    UserData,
    TokenPayload,
    AuthProvider,
} from '../interfaces/auth_interfaces';
import { User } from '../models';
import { Response, Request } from 'express';
import { config } from 'dotenv'
import { TokenServices } from './token_service';
import { GoogleServices } from './google_services';
import { UserServices } from './user_service';

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

    async googleLogin(IdToken: string, res: Response): Promise<AuthResponse> {
        const TokenPayload = await this.googleServices.verifyGoogleToken(IdToken);

        console.log(TokenPayload);

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
                return {
                    success: false,
                    message: `This account is inactive. Please contact support.`
                };
            }

            if(!user.compareGoogleId(TokenPayload.google_id)) {
                return {
                    success: false,
                    message: 'Invalid credentials'
                }
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

    async login(data: loginDto, res: Response): Promise<AuthResponse> {
        const { email, password } = data;

        const user = await User.findOne({ where: { email }});
        if (!user) {
            return {
              success: false,
              message: 'Invalid credentials'
            };
        }

        if (!user.get('isActive')) {
            return {
              success: false,
              message: `This account is inactive. Please contact support.`
            };
        }

        if (user.get('authProvider') !== 'local') {
            return {
              success: false,
              message: `Please use ${user.get('authProvider')} login for this account`
            };
        }

        const isPasswordValid = await user.comparePasswords(password);
        if(!isPasswordValid){
            return {
                success: false,
                message: 'Invalid credentials'
            };
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

    async register(data: registerDto, res: Response): Promise<AuthResponse> {
        const { username, email, password } = data;

        // verifying if the email is used
        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            return {
                success: false,
                message: 'Email already exists',
            };
        }

        // verifying if the username is used
        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername) {
            return {
                success: false,
                message: 'Username is already taken',
            };
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
                token: accessToken
            }
        };
    }

    async logout(user: UserData, res: Response): Promise<AuthResponse> {
        const userToLogout = await User.findOne({ where: { id: user.id, email: user.email } });
        if (!userToLogout) {
            return {
                success: false,
                message: 'User not found'
            };
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

    async refreshToken(req: Request, res: Response): Promise<AuthResponse> { // refreshing user tokens
        const decodedToken = this.tokenServices.getDecodedToken(req) as TokenPayload;

        const user = await User.findOne({
            where: {
                id: decodedToken.id,
                refreshToken: req.cookies.refreshToken
            }
        })

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
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
}