import { Model, DataTypes, Optional} from 'sequelize';
import sequelize from '../config/DB/database_config';
import bcrypt from 'bcrypt';
import { AuthProvider } from '../interfaces/auth';
import { AppError } from '../middleware/error_middleware';
import crypto from 'crypto';
import { ErrorTypes } from '../interfaces/error';
import { UserAttributes, UserAccountData } from '../interfaces/user'
import DownloadCredits from './Download_credits';
import { config } from '../config/env';

interface UserCreationAttributes extends Optional<UserAttributes, 
'id' | 'refreshToken' | 'googleId' | 'password' | 'profilePicture' | 'lastLogin' | 'isActive'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public refreshToken!: string | null;
    public googleId!: string | null;
    public profilePicture!: string | null;
    public authProvider!: AuthProvider;
    public isActive!: boolean;
    public lastLogin!: Date | null;
    public password!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public async comparePasswords(comparedPassword: string): Promise<boolean> {
        const currentPassword = this.get('password');
    
        // Check if password exists and user is not using Google auth
        if (!currentPassword || this.get('authProvider') === AuthProvider.GOOGLE) {
            return false;
        }
        
        return await bcrypt.compare(comparedPassword, currentPassword);
    }

    public compareGoogleId(comparedGoogleId: string): boolean {
        const currentID = this.get('googleId');
        const hashedID = this.hashGoogleId(comparedGoogleId);
        return currentID === hashedID;
    }

    public toSafeUser(): UserAccountData {
        const { username, email, profilePicture } = this.get() as UserAttributes;
        
        return {
            username,
            email,
            profilePicture
        }
    }

    public hashGoogleId(googleId: string): string {
        const GOOGLE_ID_SALT =  config.GOOGLE_ID_SALT;

        return crypto.createHash('sha256')
            .update(googleId + GOOGLE_ID_SALT)
            .digest('hex');
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true,
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            customValidator(value: string | null) {
                if (this.authProvider === AuthProvider.LOCAL && !value) {
                    throw new AppError('Password is required for local authentication', 400, ErrorTypes.VALIDATION_ERR);
                }
            }
        }
    },
    refreshToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    profilePicture: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    authProvider: {
        type: DataTypes.ENUM(...Object.values(AuthProvider)),
        allowNull: false,
        defaultValue: 'local',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        afterCreate: async (user: User) => {
            const user_id = user.id;   

            try {
                // Create initial download credits for the user
                await DownloadCredits.create({ user_id })

            } catch (error) {
                console.error('Error creating initial download credits:', error);
                throw new AppError('Failed to create initial download credits', 500, ErrorTypes.INTERNAL_ERR);
            }
        },
        beforeCreate: async (user: User) => {
            const password = user.get('password');
            const google_id = user.get('googleId');

            if(google_id){
                user.set('googleId', user.hashGoogleId(google_id));
            }

            if(password){
                const salt = await bcrypt.genSalt(10);
                user.set('password', await bcrypt.hash(password, salt));
            }
        },

        beforeUpdate: async (user: User) => {
            if(user.changed('password')){
                const password = user.get('password');
                if(password){
                    const salt = await bcrypt.genSalt(10);
                    user.set('password', await bcrypt.hash(password, salt));
                }
            }
        }
    }
})

export default User;