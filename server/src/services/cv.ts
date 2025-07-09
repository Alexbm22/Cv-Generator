import { ApiResponse } from "../interfaces/api_interface";
import { ClientCVAttributes, CVAttributes, CVTemplates } from "../interfaces/cv_interface";
import { ErrorTypes } from "../interfaces/error_interface";
import { UserAttributes } from "../interfaces/user_interface";
import { AppError } from "../middleware/error_middleware";
import { CV } from "../models";
import { NextFunction } from "express";
import { Op } from "sequelize";
import { randomUUID } from "crypto";

export class CVsService {

    static async createCVs(
        userId: number, 
        CVs: ClientCVAttributes[], 
    ): Promise<ApiResponse<ClientCVAttributes[]>> {
        const candidateCVs = CVs.map((cv) => this.fromDTO(cv, userId)) as CVAttributes[];

        CV.bulkCreate(candidateCVs,{
            validate: true
        })

        return {
            success: true,
            message: 'CVs created successfully',
            data: CVs,
        };
    } 

    static async createDefaultCV(userId: number): Promise<ApiResponse<ClientCVAttributes>> {
        const publicId = randomUUID();

        const createdCV = await CV.create({
            title: '',
            userId: userId,
            template: CVTemplates.CASTOR,
            public_id: publicId,
            version: 0,
            personalData: {
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                photo: null,
                birthDate: new Date(),
                socialLinks: [],
            },
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
            }
        })

        return {
            success: true,
            message: 'CV created successfully',
            data: this.toDTO(createdCV.get()),
        };
    }

    static async getAllCVs(userId: number): Promise<ApiResponse<ClientCVAttributes[]>> {

        const cvDTOs = await this.getUserCVs(userId);

        return {
            success: true,
            message: 'CVs fetched sucessfully!',
            data: cvDTOs
        }
    }

    static async syncCVs(
        userId: number, 
        incomingCVs: ClientCVAttributes[]
    ): Promise<ApiResponse<ClientCVAttributes[]>> {

        if(incomingCVs.length == 0){
            return {
                success: true,
                message: 'No CVs passed',
            }
        }
        
        // Transform DTOs to domain objects
        const candidateCVUpdates = incomingCVs.map((cv) => this.fromDTO(cv, userId));
    
        const cvsPublicIDs = candidateCVUpdates 
            .map((cv) => cv.public_id) 
            .filter((id): id is string => typeof id === 'string'); // filter out undefined; 

        const updatesByPublicId = new Map(
            candidateCVUpdates.map((cvUpdate) => [cvUpdate.public_id, cvUpdate])
        );

        const existingCVs = await CV.findAll({
            where: {
                userId: userId,
                public_id: { [Op.in]: cvsPublicIDs }
            }
        })

        if(this.hasVersionConflicts(existingCVs, updatesByPublicId)) {
            const userCVs = await this.getUserCVs(userId);
            return {
                success: false,
                message: "CVs version conflicts detected!",
                data: userCVs // return db CVs current version
            }
        }

        const updatePromises = existingCVs.map(async (existingCV) => {
            const existingCVAttributes = existingCV.get();
            const cvUpdate = updatesByPublicId.get(existingCVAttributes.public_id); // get the cv updated verion

            // getting just the updated fields 
            const fieldsToUpdate = this.calculateAttributeChanges<CVAttributes>(
                existingCVAttributes,
                cvUpdate!
            )

            // Only update if there are actual changes
            if(Object.keys(fieldsToUpdate).length > 0){
                existingCV.set(fieldsToUpdate);
                await existingCV.save();
                return existingCV
            }

            return existingCV;
        })

        await Promise.all(updatePromises);
        
        return {
            success: true,
            message: 'CVs synced successfully'
        }
    }

    static async deleteCV(
        user: UserAttributes, 
        cvId: string, 
    ): Promise<ApiResponse<null> | void > {
        const deleteCount = await CV.destroy({
            where: {
                userId: user.id,
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

        return {
            success: true,
            message: "CV deleted successfully!"
        }
    }

    private static async getUserCVs(userId: number) {
        const CVs = await CV.findAll({
            where: {
                userId: userId
            },
            order: [['updatedAt', 'DESC']],
        })

        const cvObjects = CVs.map((cv) => cv.get())        
        const cvDTOs = cvObjects.map((cv) => this.toDTO(cv));

        return cvDTOs;
    }

    private static calculateAttributeChanges<T extends object>(
        originalAttributes: T,
        updatedAttributes: Partial<T>
    ): Partial<T> {
        const changedAttributes: Partial<T> = {};

        for(const attributeKey of Object.keys(updatedAttributes) as Array<keyof T>) {
            const originalValue = originalAttributes[attributeKey];
            const updatedValue = updatedAttributes[attributeKey];
            
            // Only include attributes that exist in both objects and have different values
            if (originalValue !== undefined && originalValue !== updatedValue) {
                changedAttributes[attributeKey] = updatedValue;
            }
        }

        return changedAttributes;
    }

    private static hasVersionConflicts(
        dbCVs: CV[],
        updatesByPublicId: Map<string | undefined, Partial<CVAttributes>>
    ) {
        const hasVersionConflicts = dbCVs.find((existingCV) => {
            const existingCVAttributes = existingCV.get();
            const cvUpdate = updatesByPublicId.get(existingCVAttributes.public_id);

            return existingCVAttributes.version !== cvUpdate?.version;
        })

        return hasVersionConflicts;
    }

    private static fromDTO(cv: ClientCVAttributes, userId: number): Partial<CVAttributes> {
        return {
            public_id: cv.id ?? randomUUID(),
            title: cv.title,
            template: cv.template,
            version: cv.version ?? 0,
            userId: userId,
            personalData: {
                photo: cv.photo,
                phoneNumber: cv.phoneNumber,
                firstName: cv.firstName,
                lastName: cv.lastName,
                email: cv.email,
                address: cv.address,
                birthDate: cv.birthDate,
                socialLinks: cv.socialLinks
            },
            content: {
                professionalSummary: cv.professionalSummary,
                languages: cv.languages,
                skills: cv.skills,
                workExperience: cv.workExperience,
                education: cv.education,
                projects: cv.projects,
                customSections: cv.customSections,
                sectionsOrder: cv.sectionsOrder
            }
        }
    }

    private static toDTO(cv: CVAttributes): ClientCVAttributes {
        return {
            id: cv.public_id,
            title: cv.title,
            template: cv.template,
            sectionsOrder: cv.content.sectionsOrder,
            updatedAt: cv.updatedAt.getTime(),
            professionalSummary: cv.content.professionalSummary,
            languages: cv.content.languages,
            skills: cv.content.skills,
            workExperience: cv.content.workExperience,
            education: cv.content.education,
            projects: cv.content.projects,
            customSections: cv.content.customSections,
            photo: cv.personalData?.photo || null,
            firstName: cv.personalData!.firstName,
            lastName: cv.personalData!.lastName,
            email: cv.personalData!.email,
            phoneNumber: cv.personalData!.phoneNumber,
            address: cv.personalData!.address,
            birthDate: cv.personalData!.birthDate,
            socialLinks: cv.personalData!.socialLinks,
            version: cv.version,
        }
    }
}