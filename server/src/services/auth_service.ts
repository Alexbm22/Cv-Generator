import {
    loginDto,
    registerDto,
    AuthResponse,
    UserData,
    TokenData,
    TokenPayload
} from '../interfaces/auth_interfaces';
import { User } from '../models';
import { Response, Request } from 'express';
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config()

export class AuthServices {
    private readonly JWT_SECRET: string;
    private readonly JWT_REFRESH_SECRET: string;
    private readonly JWT_EXPIRATION: string;
    private readonly JWT_REFRESH_EXPIRATION: string;

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'secret';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
        this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
        this.JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
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
            authProvider: 'local',
            lastLogin: new Date(),
            isActive: true,
        });
        
        const tokens = this.generateTokens(newUser); // generating the access and refresh tokens
        
        // Set the refresh token in the client cookies
        this.setRefreshToken(tokens.refreshToken, res);
        
        const accessExpirationDate = this.getExpirationDate(this.JWT_EXPIRATION);
        
        await User.update({
            refreshToken: tokens.refreshToken,
        }, {
            where: { 
                id: newUser.id
            },
        })

        return {
            success: true,
            message: 'User registered successfully',
            data: {
                user: newUser.safeUser() as UserData,
                tokens: {
                    accessToken: tokens.accessToken,
                    expiresIn: accessExpirationDate
                }
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

        const tokens = this.generateTokens(user); // generating the access and refresh tokens

        this.setRefreshToken(tokens.refreshToken, res); // Set the refresh token in the client cookies

        const accessExpirationDate = this.getExpirationDate(this.JWT_EXPIRATION);

        await User.update({
            refreshToken: tokens.refreshToken,
        }, {
            where: { 
                id: user.get('id')
            },
        })

        return {
            success: true,
            message: 'Login successfully',
            data: {
                user: user.safeUser() as UserData,
                tokens: {
                    accessToken: tokens.accessToken,
                    expiresIn: accessExpirationDate
                }
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
        const token = req.cookies.refreshToken;
        if (!token) {
            return {
                success: false,
                message: 'Refresh token not found'
            };
        }

        let decodedToken: TokenPayload;
        try {
            decodedToken = jwt.verify(
                token,
                this.JWT_REFRESH_SECRET as string
            ) as TokenPayload;
        } catch (error) {
            return {
                success: false,
                message: 'Invalid refresh token'
            };
        }

        const user = await User.findOne({
            where: {
                id: decodedToken.id,
                refreshToken: token
            }
        })

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        } 

        const tokens = this.generateTokens(user);
        this.setRefreshToken(tokens.refreshToken, res);

        const accessExpirationDate = this.getExpirationDate(this.JWT_EXPIRATION);

        await User.update({
            refreshToken: tokens.refreshToken,
        }, {
            where: { 
                id: user.get('id')
            },
        })

        return {
            success: true,
            message: 'Refreshed Tokens successfully',
            data: {
                user: user.safeUser() as UserData,
                tokens: {
                    accessToken: tokens.accessToken,
                    expiresIn: accessExpirationDate
                }
            }
        };

    }

    private generateTokens(user: User): TokenData {
        const payload = {
            id: user.get('id') ? user.get('id') : user.id,
        } as TokenPayload

        const accessToken = jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
            expiresIn: this.JWT_EXPIRATION as any
        })

        const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET as jwt.Secret, {
            expiresIn: this.JWT_REFRESH_EXPIRATION as any
        })

        return {
            accessToken,
            refreshToken
        }
    }

    private setRefreshToken(token: string, res: Response): void{
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: this.getExpirationInSeconds(this.JWT_REFRESH_EXPIRATION) * 1000,
        })
    }

    private getExpirationInSeconds(expiration: string | number): number {
        if (typeof expiration === 'number') return expiration;
        
        // Parse string like '1h', '7d', etc.
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match) return 3600; // Default to 1 hour
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 's': return value;
          case 'm': return value * 60;
          case 'h': return value * 60 * 60;
          case 'd': return value * 24 * 60 * 60;
          default: return 3600;
        }
    }

    getExpirationDate(expiration: string): Date {
        const expiresIn = this.getExpirationInSeconds(expiration);
        return new Date(Date.now() + expiresIn * 1000);
    }

}