import { Op } from "sequelize";
import { ServerUserAttributes, UserWithMediaFiles, UserCreationAttributes } from "../interfaces/user"
import { MediaFiles, User } from "../models"

const getUserByFields = async (fields: Partial<ServerUserAttributes>) => {
    return await User.findOne({
        where: fields
    });
}

const getUserWithMediaFile = async (fields: Partial<ServerUserAttributes>) => {
    return await User.findOne({
        where: fields,
        include: [{
            model: MediaFiles,
            as: 'mediaFile'
        }]
    }) as UserWithMediaFiles | null;
}

const getUsersByFields = async (fields: Partial<ServerUserAttributes>) => {
    return await User.findOne({
        where: fields
    });
}

const findExistingCredentials = async (email: string, username: string) => {
    return await User.findAll({
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
        ...userData,
        lastLogin: new Date()
    });
}
 
const saveUserChanges = async (updates: Partial<ServerUserAttributes>, userInstance: User) => {
    return await userInstance.update(updates);
}

const saveUserChangesWithHooks = async (updates: Partial<ServerUserAttributes>, userInstance: User) => {
    userInstance.set(updates);
    return await userInstance.save();
}

const updateUserByFields = async (
    updates: Partial<ServerUserAttributes>,
    whereConditions: Partial<ServerUserAttributes> 
) => {
    return await User.update(updates, {
        where: whereConditions
    });
}

export default {
    getUserByFields,
    getUsersByFields,
    getUserWithMediaFile,
    findExistingCredentials,
    createUser, 
    saveUserChanges,
    saveUserChangesWithHooks,
    updateUserByFields
}