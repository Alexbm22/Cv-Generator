import { PublicCVAttributes, CVAttributes, CVTemplates } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { UserAttributes } from "../interfaces/user";
import { AppError } from "../middleware/error_middleware";
import { CV } from "../models";
import { Op } from "sequelize";
import { randomUUID } from "crypto";

export class CVsService {

    static async createCVs(
        userId: number, 
        CVs: PublicCVAttributes[], 
    ): Promise<PublicCVAttributes[]> {
        const candidateCVs = CVs.map((cv) => this.fromDTO(cv, userId)) as CVAttributes[];

        CV.bulkCreate(candidateCVs,{
            validate: true
        })

        return CVs
    } 

    static async createDefaultCV(userId: number): Promise<PublicCVAttributes> {
        const createdCV = await CV.create({
            title: '',
            jobTitle: '',
            user_id: userId,
            template: CVTemplates.CASTOR,
            version: 0,
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
                photo: null,
                birthDate: new Date(),
                socialLinks: [],
            }
        })

        return this.toDTO(createdCV.get());
    }

    static async getAllCVs(userId: number): Promise<PublicCVAttributes[]> {
        return await this.getUserCVs(userId);
    }

    static async syncCVs(
        userId: number, 
        incomingCVs: PublicCVAttributes[]
    ): Promise<void> {

        if(incomingCVs.length == 0) return;
        
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
                user_id: userId,
                public_id: { [Op.in]: cvsPublicIDs }
            }
        })

        if(this.hasVersionConflicts(existingCVs, updatesByPublicId)) {
            throw new AppError(
                'Version conflict detected. Please refresh and try again.',
                409,
                ErrorTypes.VERSION_CONFLICT
            );
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
            }
        })

        await Promise.all(updatePromises);
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

    private static async getUserCVs(userId: number) {
        const CVs = await CV.findAll({
            where: {
                user_id: userId
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
            if (originalValue !== undefined && JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
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

    public static fromDTO(cv: PublicCVAttributes, userId: number): Partial<CVAttributes> {
        return {
            public_id: cv.id ?? randomUUID(),
            title: cv.title,
            jobTitle: cv.jobTitle,
            template: cv.template,
            version: cv.version ?? 0,
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

    public static toDTO(cv: CVAttributes): PublicCVAttributes {
        return {
            id: cv.public_id,
            title: cv.title,
            jobTitle: cv.jobTitle,
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
            photo: cv.content?.photo || null,
            firstName: cv.content!.firstName,
            lastName: cv.content!.lastName,
            email: cv.content!.email,
            phoneNumber: cv.content!.phoneNumber,
            address: cv.content!.address,
            birthDate: cv.content!.birthDate,
            socialLinks: cv.content!.socialLinks,
            version: cv.version,
        }
    }
}