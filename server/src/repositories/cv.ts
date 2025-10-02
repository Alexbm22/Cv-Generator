import { CVWithMediaFiles } from "../models/CV";
import { ServerCVAttributes } from "../interfaces/cv";
import { CV, MediaFiles } from "../models";
import cvFactories from '../factories/cv';

const createCVs = async (cvs: Omit<ServerCVAttributes, 'id' | 'encryptedContent' | 'updatedAt' | 'createdAt'>[]) => {
    return await CV.bulkCreate(cvs, {
        validate: true
    });
}

const createCV = async (userId: number) => {
    return await CV.create({
        user_id: userId,
        ...cvFactories.createDefaultCVObject()
    })
}

const getCVsWithMediaFiles = async (userId: number) => {
    return await CV.findAll({
        where: {
            user_id: userId
        },
        include: [
            {
                model: MediaFiles,
                as: 'mediaFiles'
            }
        ],
        order: [['updatedAt', 'DESC']],
    }) as CVWithMediaFiles[];
}

const getCVWithMediaFiles = async (userId: number, cvPublicId: string) => {
    return await CV.findOne({
        where: {
            user_id: userId,
            public_id: cvPublicId,
        }, 
        include: [{
            model: MediaFiles,
            required: true,
            as: 'mediaFiles'
        }]
    }) as CVWithMediaFiles;
}

const updateCV = async (cv: CVWithMediaFiles, updatedFields: Partial<ServerCVAttributes>) => {
    cv.set(updatedFields);
    await cv.save();
}

const deleteCV = async (userId: number, cvPublicId: string) => {
    return await CV.destroy({
        where: {
            user_id: userId,
            public_id: cvPublicId
        }
    });
}

export default { 
    createCVs, 
    createCV,
    getCVsWithMediaFiles, 
    getCVWithMediaFiles,
    updateCV,
    deleteCV
}