import { Model, DataTypes, Transaction } from 'sequelize';
import sequelize from '../config/DB/database_config';
import bcrypt from 'bcrypt';
import { AuthProvider } from '../interfaces/auth';
import { AppError } from '../middleware/error_middleware';
import crypto from 'crypto';
import { ErrorTypes } from '../interfaces/error';
import { ServerUserAttributes, UserCreationAttributes } from '../interfaces/user'
import DownloadCredits from './Download_credits';
import { config } from '../config/env';
import { generateUUID } from '@/utils/uuid';
import { lowerCaseIfString } from '@/utils/stringUtils/lowerCaseIfString';
import { CVsService } from '@/services/cv';
import { MediaFilesServices } from '@/services/mediaFiles';
import { OwnerType } from '@/interfaces/mediaFiles';
import { DownloadsService } from '@/services/downloads';
import { PaymentService } from '@/services/payments';
import { SubscriptionService } from '@/services/subscriptions';
import { CreditsService } from '@/services/credits';
import { StripeService } from '@/services/stripe';
import { PasswordHasher } from '@/utils/passwordHasher';
import { AccountType } from '@/interfaces/actor';

export const createInitialCredits = async (userId: number, transaction?: Transaction): Promise<void> => {
    try {
        await DownloadCredits.create({ user_id: userId }, { transaction });
    } catch (error) {
        console.error('Error creating initial download credits:', error);
        throw new AppError('Failed to create initial download credits', 500, ErrorTypes.INTERNAL_ERR);
    }
};

// Stripe customer creation is a secondary operation and must never block user creation
export const attachStripeCustomer = async (user: User): Promise<void> => {
    try {
        const stripeCustomerId = await StripeService.createCustomerForUser(user);
        if (stripeCustomerId) {
            await User.update(
                { stripeCustomerId },
                { where: { id: user.get('id') } }
            );
        }
    } catch (error) {
        console.error('Error creating Stripe customer:', error);
    }
};

class User extends Model<ServerUserAttributes, UserCreationAttributes> implements ServerUserAttributes {
    declare id: number;
    declare public_id: string;
    declare type: AccountType;
    declare username: string | null;
    declare email: string | null;
    declare googleId: string | null;
    declare authProvider: AuthProvider;
    declare isActive: boolean;
    declare needsInitialSync: boolean;
    declare useProfilePictureAsDefault: boolean;
    declare customColors: string[];
    declare lastLogin: Date | null;
    declare passwordChangedAt: Date | null;
    declare password: string | null;
    declare tokenVersion: number;
    declare stripeCustomerId: string | null;
    declare guestTokenHash: string | null;
    declare lastSeenAt: Date | null;
    declare convertedAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    public toJSON(): object {
        const values = this.get({ plain: true }) as unknown as Record<string, unknown>;
        delete values.password;
        delete values.googleId;
        delete values.tokenVersion;
        return values;
    }

    public async comparePasswords(comparedPassword: string): Promise<boolean> {
        const currentPassword = this.get('password');
    
        // Password login is allowed for any user with a stored hash, regardless of provider
        if (!currentPassword) {
            return false;
        }
        
        if (currentPassword.startsWith('$argon2id$')) {
            return PasswordHasher.verify(currentPassword, comparedPassword);
        }

        return await bcrypt.compare(comparedPassword, currentPassword);
    }

    public compareGoogleId(comparedGoogleId: string): boolean {
        const currentID = this.get('googleId');
        const hashedID = this.hashGoogleId(comparedGoogleId);
        return currentID === hashedID;
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
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => generateUUID(),
    },
    type: {
        type: DataTypes.STRING(16),
        allowNull: false,
        validate: {
            isIn: [['guest', 'registered']],
        }
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        set(value: string | null) {
            this.setDataValue('username', lowerCaseIfString(value) as string);
        },
        validate: {
            notEmpty: true,
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        set(value: string | null) {
            this.setDataValue('email', lowerCaseIfString(value) as string);
        },
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
                if (this.type === 'registered' && this.authProvider === 'local' && !value) {
                    throw new AppError('Password is required for local authentication', 400, ErrorTypes.VALIDATION_ERR);
                }
            }
        }
    },
    googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    authProvider: {
        type: DataTypes.ENUM(...Object.values(['local', 'google'] as const)),
        allowNull: false,
        defaultValue: 'local',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    needsInitialSync: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    useProfilePictureAsDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    customColors: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false,
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    tokenVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    stripeCustomerId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    guestTokenHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true,
    },
    lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    convertedAt: {
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
    indexes: [
        { name: 'users_type_last_seen_at_idx', fields: ['type', 'last_seen_at'] }
    ],
    validate: {
        // Runs on instance saves; static updates build a partial instance without a type.
        identityMatchesType() {
            const type = this.type;
            const email = this.email;
            if (type === 'registered' && !email) {
                throw new AppError('Registered accounts require an email', 400, ErrorTypes.VALIDATION_ERR);
            }
            if (type === 'guest' && email) {
                throw new AppError('Guest accounts cannot have an email', 400, ErrorTypes.VALIDATION_ERR);
            }
        }
    },
    hooks: {
        afterCreate: async (user: User) => {
            if (user.get('type') !== 'registered') {
                return;
            }
            await createInitialCredits(user.get('id'));
            await attachStripeCustomer(user);
        },
        beforeCreate: async (user: User) => {
            const google_id = user.get('googleId');

            if(google_id){
                user.set('googleId', user.hashGoogleId(google_id));
            }
        },

        beforeDestroy: async (user: User) => {
            const user_id = user.get().id;

            // Delete user's CVs (which will also trigger CV hooks to delete media files)
            await CVsService.deleteUserCVs(user_id);
            
            // Delete user's media files
            await MediaFilesServices.deleteOwnerMediaFiles(user_id, OwnerType.USER);
            
            // Delete user's downloads (which will also trigger Download hooks if any)
            await DownloadsService.deleteUserDownloads(user_id);
            
            // Delete user's payments
            await PaymentService.deleteUserPayments(user_id);
            
            // Delete user's subscriptions
            await SubscriptionService.deleteUserSubscriptions(user_id);
            
            // Delete user's download credits
            await CreditsService.deleteUserCredits(user_id);

        }
    }
})

export default User;