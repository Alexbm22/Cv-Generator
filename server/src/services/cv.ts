import { PublicCVAttributes, CVAttributes, PublicCVMetadataAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { UserAttributes } from "../interfaces/user";
import { AppError } from "../middleware/error_middleware";
import { CV, MediaFiles } from "../models";
import { randomUUID } from "crypto";
import { MediaTypes, OwnerTypes } from "../interfaces/mediaFiles";

export class CVsService {

    static async createCVs(
        userId: number, 
        CVs: PublicCVAttributes[], 
    ) {

        const candidateCVs = CVs.map(cv => this.mapPublicCVToServerCV(cv, userId));

        return CV.bulkCreate(candidateCVs, {
            validate: true
        });
    } 

    static async createCV(userId: number) {
        const createdCV = await CV.create({
            user_id: userId
        })

        const cvPhoto = await MediaFiles.create({
            owner_id: createdCV.id,
            owner_type: OwnerTypes.CV,
            type: MediaTypes.CV_PHOTO,
            obj_key: `cv_photo/${createdCV.id}`
        })

        return createdCV;
    }

    static async syncCV(
        user_id: number, 
        CVUpdates: Partial<PublicCVAttributes>,
        cvPublicId: string
    ) {

        const existingCV = await CV.findOne({
            where: {
                user_id,
                public_id: cvPublicId,
            }
        })

        if(!existingCV) {
            throw new AppError(
                'CV not found.',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        const currentPublicCV = this.mapServerCVToPublicCV(existingCV.get());
        const mergedPublicCV = {
            ...currentPublicCV,
            ...CVUpdates
        }

        const dbFieldsToUpdate = this.mapPublicCVToServerCV(mergedPublicCV, user_id)

        existingCV.set(dbFieldsToUpdate)
        await existingCV.save();

        return this.mapServerCVToPublicCV(existingCV.get());
    }

    static async deleteCV(
        user: UserAttributes, 
        cvId: string, 
    ): Promise<void> {
        const deleteCount = await CV.destroy({
            where: {
                user_id: user.id,
                public_id: cvId
            }
        })

        if(deleteCount <= 0) {
            throw new AppError(
                'Something went wrong. Please contact support.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }   
    }

    static async getUserCVs(userId: number) {
        return await CV.findAll({
            where: {
                user_id: userId
            },
            order: [['updatedAt', 'DESC']],
        })
    }

    static async getUserCV(user_id: number, cvPublicId: string) {
        const cv = await CV.findOne({
            where: {
                user_id,
                public_id: cvPublicId
            }
        })

        if(!cv) {
            throw new AppError(
                'CV not found.',
                404,
                ErrorTypes.NOT_FOUND
            )
        } else {
            return cv;
        }
    }

    static getCVMetaData(CV: CVAttributes): PublicCVMetadataAttributes {
        return {
            id: CV.public_id,
            title: CV.title,
            jobTitle: CV.jobTitle,
            template: CV.template,
            createdAt: CV.createdAt,
            updatedAt: CV.updatedAt
        }
    }

    public static mapPublicCVToServerCV(
        cv: PublicCVAttributes, 
        userId: number
    ): Omit<CVAttributes, 'id' | 'encryptedContent' | 'updatedAt' | 'createdAt'> 
    {
        return {
            public_id: cv.id ?? randomUUID(),
            title: cv.title,
            jobTitle: cv.jobTitle,
            template: cv.template,
            user_id: userId,
            content: {
                professionalSummary: cv.professionalSummary,
                languages: cv.languages,
                skills: cv.skills,
                workExperience: cv.workExperience,
                education: cv.education,
                projects: cv.projects,
                customSections: cv.customSections,
                sectionsOrder: cv.sectionsOrder,
                photo: cv.photo,
                phoneNumber: cv.phoneNumber,
                firstName: cv.firstName,
                lastName: cv.lastName,
                email: cv.email,
                address: cv.address,
                birthDate: cv.birthDate,
                socialLinks: cv.socialLinks
            }
        }
    }

    public static mapServerCVToPublicCV(cv: CVAttributes): PublicCVAttributes {
        return {
            id: cv.public_id,
            title: cv.title,
            jobTitle: cv.jobTitle,
            template: cv.template,
            updatedAt: cv.updatedAt,
            createdAt: cv.createdAt,
            ...cv.content,
        }
    }
}