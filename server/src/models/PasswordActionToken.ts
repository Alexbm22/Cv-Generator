import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/DB/database_config';
import {
    PasswordActionTokenAttributes,
    PasswordActionTokenCreationAttributes,
    PasswordActionType,
} from '../interfaces/passwordAction';

class PasswordActionToken extends Model<
    PasswordActionTokenAttributes,
    PasswordActionTokenCreationAttributes
> implements PasswordActionTokenAttributes {
    public id!: number;
    public userId!: number;
    public tokenHash!: string;
    public type!: PasswordActionType;
    public expiresAt!: Date;
    public createdAt!: Date;
    public usedAt!: Date | null;
    public revokedAt!: Date | null;
}

PasswordActionToken.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
    },
    tokenHash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(PasswordActionType)),
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'password_action_tokens',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { name: 'password_action_tokens_token_hash_uq', unique: true, fields: ['token_hash'] },
        { name: 'password_action_tokens_user_id_idx', fields: ['user_id'] },
        { name: 'password_action_tokens_expires_at_idx', fields: ['expires_at'] },
    ],
});

export default PasswordActionToken;