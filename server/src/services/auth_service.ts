import {
    loginDto,
    registerDto,
    AuthResponse,
    UserData,
    TokenData,
    AuthRequest,
    TokenClientData
} from '../interfaces/auth_interfaces';
import { User } from '../models';
import { Response } from 'express';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

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
        const existingUserByEmail = await User.findOne({ where: { email } });

        if (existingUserByEmail) {
            return {
                success: false,
                message: 'Email already exists',
            };
        }

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
        
        const tokens = this.generateTokens(newUser);

        this.setRefreshToken(tokens.refreshToken, res);

        const refreshExpiresIn = this.getExpirationInSeconds(this.JWT_REFRESH_EXPIRATION);
        const refreshExpirationDate = new Date(Date.now() + refreshExpiresIn * 1000);

        newUser.update({
            refreshToken: tokens.refreshToken,
            refreshTokenExpiry: refreshExpirationDate
        })

        const accessExpiresIn = this.getExpirationInSeconds(this.JWT_EXPIRATION);
        const accessExpirationDate = new Date(Date.now() + accessExpiresIn * 1000);

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

        if (!user.isActive) {
            return {
              success: false,
              message: `${user.get('isActive')}`
            };
        }

        if (user.authProvider !== 'local') {
            return {
              success: false,
              message: `Please use ${user.authProvider} login for this account`
            };
        }

        const isPasswordValid = await user.comparePasswords(password);
        if(!isPasswordValid){
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }

        const tokens = this.generateTokens(user);

        this.setRefreshToken(tokens.refreshToken, res);

        const refreshExpiresIn = this.getExpirationInSeconds(this.JWT_REFRESH_EXPIRATION);
        const refreshExpirationDate = new Date(Date.now() + refreshExpiresIn * 1000);

        user.update({
            refreshToken: tokens.refreshToken,
            refreshTokenExpiry: refreshExpirationDate
        })

        const accessExpiresIn = this.getExpirationInSeconds(this.JWT_EXPIRATION);
        const accessExpirationDate = new Date(Date.now() + accessExpiresIn * 1000);

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

    private generateTokens(user: User): TokenData {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email
        }

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

}