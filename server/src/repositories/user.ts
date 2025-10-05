import { Op } from "sequelize";
import { UserAttributes, UserCreationAttributes } from "../interfaces/user"
import { User } from "../models"

const getUserByFields = async (fields: Partial<UserAttributes>) => {
    return User.findOne({
        where: fields
    });
}

const getUsersByFields = async (fields: Partial<UserAttributes>) => {
    return User.findOne({
        where: fields
    });
}

const findExistingCredentials = async (email: string, username: string) => {
    return User.findAll({
        where: {
            [Op.or]: [
                { email },
                { username }
            ]
        },
        attributes: ['email', 'username'] // optimizare - selectăm doar câmpurile necesare
    });
}

const createUser = async (userData: UserCreationAttributes) => {
    return await User.create({
        username: userData.username,
        email: userData.email,
        authProvider: userData.authProvider,
        lastLogin: new Date(),
        googleId: userData.googleId,
        isActive: userData.isActive,
        profilePicture: userData.profilePicture
    });
}
 
const saveUserChanges = async (updates: Partial<UserAttributes>, userInstance: User) => {
    return await userInstance.update(updates);
}

const saveUserChangesWithHooks = async (updates: Partial<UserAttributes>, userInstance: User) => {
    userInstance.set(updates);
    return await userInstance.save();
}

const updateUserByFields = async (
    updates: Partial<UserAttributes>,
    whereConditions: Partial<UserAttributes> 
) => {
    return await User.update(updates, {
        where: whereConditions
    });
}

export default {
    getUserByFields,
    getUsersByFields,
    findExistingCredentials,
    createUser, 
    saveUserChanges,
    saveUserChangesWithHooks,
    updateUserByFields
}