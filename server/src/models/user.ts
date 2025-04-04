import { Model, DataTypes, Optional} from 'sequelize';
import sequelize from '../config/database_config';
import bcrypt from 'bcrypt';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string | null;
    refreshToken: string | null;
    refreshTokenExpiry: Date | null;
    googleId: string | null;
    profilePicture: string | null;
    authProvider: 'local' | 'google';
    isActive: boolean;
    lastLogin: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 
'id' | 'refreshToken' | 'googleId' | 'password' | 'profilePicture' | 'lastLogin' | 'isActive'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public refreshToken!: string | null;
    public refreshTokenExpiry!: Date | null;
    public googleId!: string | null;
    public profilePicture!: string | null;
    public authProvider!: 'local' | 'google';
    public isActive!: boolean;
    public lastLogin!: Date | null;
    public password!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public async comparePasswords(ComparedPassword: string): Promise<boolean> {
        return await bcrypt.compare(ComparedPassword, this.get('password'));
    }

    public safeUser(): Omit<UserAttributes, 'password' | 'refreshToken' | 'refreshTokenExpiry'> {
        const {password, refreshToken, refreshTokenExpiry, ...safeUser} = this.get() as UserAttributes;
        
        //resolving the issue of id being undefined in the safeUser object
        // this is a workaround to ensure that the id is always present in the safeUser object
        if(this.id) {
            safeUser.id = this.id;
        }

        return safeUser;
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
        allowNull: false
    },
    refreshToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    refreshTokenExpiry: {
        type: DataTypes.DATE,
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
        type: DataTypes.ENUM('local', 'google'),
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
    tableName: 'User',
    hooks: {
        beforeCreate: async (user: User) => {
            const password = user.get('password');
            if(password){
                const salt = await bcrypt.genSalt(10);
                user.set('password', await bcrypt.hash(password, salt));
            }
        },

        beforeUpdate: async (user: User) => {
            if(user.changed('password')){
                const password = user.get('password');
                const salt = await bcrypt.genSalt(10);
                user.set('password', await bcrypt.hash(password, salt));
            }
        }
    }
})

export default User;