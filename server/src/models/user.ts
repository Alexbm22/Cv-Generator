import { Model, DataTypes, Optional} from 'sequelize';
import sequelize from '../config/database_config';
import bcrypt from 'bcrypt';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class user extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    public async comparePasswords(ComparedPassword: string): Promise<boolean> {
        return await bcrypt.compare(ComparedPassword, this.password);
    }

    public safeUser(): Omit<UserAttributes, 'password'> {
        const {password, ...safeUser} = this.get() as UserAttributes;
        return safeUser;
    }
}

user.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 30]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    sequelize,
    tableName: 'user',
    hooks: {
        beforeCreate: async (user: user) => {
            if(user.password){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },

        beforeUpdate: async (user: user) => {
            if(user.changed('password')){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
})

export default user;