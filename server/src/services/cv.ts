import { PublicCVAttributes, ServerCVAttributes, PublicCVMetadataAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { UserAttributes } from "../interfaces/user";
import { AppError } from "../middleware/error_middleware";
import { CV, MediaFiles } from "../models";
import { randomUUID } from "crypto";
import { MediaFilesCreationAttributes, MediaTypes, OwnerTypes, PublicMediaFilesAttributes } from "../interfaces/mediaFiles";
import { MediaFilesServices } from "./mediaFiles";
import { CVWithMediaFiles } from "../models/CV";

export class CVsService {

    static async createCVs(
        userId: number, 
        publicCVs: PublicCVAttributes[], 
    ) {
        const serverCVs = publicCVs.map(cv => this.mapPublicCVToServerCV(cv, userId));

        const createdCVs = await CV.bulkCreate(serverCVs, {
            validate: true
        });

        const photoMediaFileObjs = createdCVs.map(cv => this.createCVPhotoMediaFileObj(cv.get().id, cv.get().title));
        const createdPhotos = await MediaFilesServices.bulkCreate(photoMediaFileObjs);

        const previewMediaFileObjs = createdCVs.map(cv => this.createCVPreviewMediaFileObj(cv.get().id, cv.get().title));
        const createdPreviews = await MediaFilesServices.bulkCreate(previewMediaFileObjs);

        const photoMap = new Map(createdPhotos.map(photo => [photo.get().owner_id, photo]));
        const previewMap = new Map(createdPreviews.map(preview => [preview.get().owner_id, preview]));

        const result = createdCVs.map(cv => {
            const photo = photoMap.get(cv.get().id)!; 
            const preview = previewMap.get(cv.get().id)!;

            return {
                CVData: cv,
                CVPhoto: photo,
                CVPreview: preview
            }
        });

        console.error(result)

        return result;
    } 

    static async createCV(userId: number) {
        const cv = await CV.create({
            user_id: userId,
            content: {
                professionalSummary: '',
                sectionsOrder: [],
                languages: [],
                skills: [],
                workExperience: [],
                education: [],
                projects: [],
                customSections: {
                    title: '',
                    content: []
                },
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                birthDate: new Date(),
                socialLinks: [],
            }
        });

        const photo = await MediaFilesServices.create(this.createCVPhotoMediaFileObj(cv.id, cv.title));
        const preview = await MediaFilesServices.create(this.createCVPreviewMediaFileObj(cv.id, cv.title));

        return {
            createdCV: cv,
            createdCVPhoto: photo,
            createdCVPreview: preview
        };
    }
    
    static async syncCV(
        userId: number, 
        updatedPublicCV: PublicCVAttributes
    ) {
        const { CVData: existingCV } = await this.getCV(userId, updatedPublicCV.id);
        const updatedServerCV = this.mapPublicCVToServerCV(updatedPublicCV, userId) as ServerCVAttributes; 
        
        const existingCVData = existingCV.get();
        const changedFields: any = {};

        Object.keys(existingCVData).forEach((key) => {
            if (key in updatedServerCV && key in existingCVData) {
                const typedKey = key as keyof typeof updatedServerCV;
                if (
                    JSON.stringify(existingCVData[typedKey]) !== JSON.stringify(updatedServerCV[typedKey])
                ) {
                    changedFields[typedKey] = updatedServerCV[typedKey];
                }
            }
        });

        const updatedFields = changedFields as Partial<ServerCVAttributes>;

        if (Object.keys(changedFields).length > 0) {
            existingCV.set(updatedFields);
            await existingCV.save();
        }

        return updatedFields;
    }

    static async deleteCV(
        user: UserAttributes, 
        cvPublicId: string, 
    ): Promise<void> {
        const deletedCount = await CV.destroy({
            where: {
                user_id: user.id,
                public_id: cvPublicId
            }
        });
        
        if(deletedCount <= 0) {
            throw new AppError(
                'Something went wrong. Please contact support.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }   
    }
    
    static async getUserCVs(userId: number) {
        const cvs = await CV.findAll({
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

        return cvs.map(cv => {
            const photo = cv.mediaFiles.find(mediaFile => mediaFile.get().type === MediaTypes.CV_PHOTO)!;
            const preview = cv.mediaFiles.find(mediaFile => mediaFile.get().type === MediaTypes.CV_PREVIEW)!;

            return {
                CVData: cv,
                CVPhoto: photo,
                CVPreview: preview
            };
        });
    }
    
    static async getCV(userId: number, cvPublicId: string) {
        const cv = await CV.findOne({
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

        if(!cv) {
            throw new AppError(
                'CV not found.',
                404,
                ErrorTypes.NOT_FOUND
            );
        }

        if(cv.mediaFiles) {
            const photo = cv.mediaFiles.find(mediaFile => mediaFile.get().type === MediaTypes.CV_PHOTO)!;
            const preview = cv.mediaFiles.find(mediaFile => mediaFile.get().type === MediaTypes.CV_PREVIEW)!;

            return {
                CVData: cv,
                CVPhoto: photo,
                CVPreview: preview
            };
        } else {
            throw new AppError(
                "error, no media files found",
                404,
                ErrorTypes.NOT_FOUND
            );
        }
    }
    
    static async getCVMetaData(cv: ServerCVAttributes, preview: MediaFiles, photo: MediaFiles): Promise<PublicCVMetadataAttributes> {

        const publicPreview = await MediaFilesServices.getPublicMediaFileData(preview);
        const publicPhoto = await MediaFilesServices.getPublicMediaFileData(photo);

        return {
            id: cv.public_id,
            title: cv.title,
            jobTitle: cv.jobTitle,
            template: cv.template,
            preview: publicPreview,
            photo: publicPhoto,
            createdAt: cv.createdAt,
            updatedAt: cv.updatedAt
        };
    }

    public static mapPublicCVToServerCV(
        cv: PublicCVAttributes, 
        userId: number
    ): Omit<ServerCVAttributes, 'id' | 'encryptedContent' | 'updatedAt' | 'createdAt'> 
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
                phoneNumber: cv.phoneNumber,
                firstName: cv.firstName,
                lastName: cv.lastName,
                email: cv.email,
                address: cv.address,
                birthDate: cv.birthDate,
                socialLinks: cv.socialLinks
            }
        };
    }
    
    public static mapServerCVToPublicCV(
        cv: ServerCVAttributes, 
        photo: PublicMediaFilesAttributes,
        preview: PublicMediaFilesAttributes
    ): PublicCVAttributes{
        return {
            photo,
            preview,
            id: cv.public_id,
            title: cv.title,
            jobTitle: cv.jobTitle,
            template: cv.template,
            updatedAt: cv.updatedAt,
            createdAt: cv.createdAt,
            ...cv.content,
        };
    }

    private static createCVPhotoMediaFileObj(cvId: number, cv_title: string): Omit<MediaFilesCreationAttributes, 'obj_key'> {
        return {
            owner_id: cvId,
            file_name: cv_title,
            owner_type: OwnerTypes.CV,
            type: MediaTypes.CV_PHOTO,
        };
    }

    private static createCVPreviewMediaFileObj(cvId: number, cv_title: string): Omit<MediaFilesCreationAttributes, 'obj_key'> {
        return {
            owner_id: cvId,
            file_name: cv_title,
            owner_type: OwnerTypes.CV,
            type: MediaTypes.CV_PREVIEW,
        };
    }
}