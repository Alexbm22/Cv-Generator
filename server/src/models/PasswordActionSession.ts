import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/DB/database_config';
import {
    PasswordActionSessionAttributes,
    PasswordActionSessionCreationAttributes,
} from '../interfaces/passwordAction';

class PasswordActionSession extends Model<
    PasswordActionSessionAttributes,
    PasswordActionSessionCreationAttributes
> implements PasswordActionSessionAttributes {
    public id!: number;
    public userId!: number;
    public passwordActionTokenId!: number;
    public sessionSecretHash!: string;
    public expiresAt!: Date;
    public createdAt!: Date;
    public completedAt!: Date | null;
    public revokedAt!: Date | null;
}

PasswordActionSession.init({
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
    passwordActionTokenId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'password_action_tokens', key: 'id' },
        onDelete: 'CASCADE',
    },
    sessionSecretHash: {
        type: DataTypes.CHAR(64),
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
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'password_action_sessions',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { name: 'password_action_sessions_secret_hash_uq', unique: true, fields: ['session_secret_hash'] },
        { name: 'password_action_sessions_user_id_idx', fields: ['user_id'] },
        { name: 'password_action_sessions_expires_at_idx', fields: ['expires_at'] },
        { name: 'password_action_sessions_token_id_idx', fields: ['password_action_token_id'] },
    ],
});

export default PasswordActionSession;