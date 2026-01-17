import { CVCreationAttributes, CVTemplates } from "../interfaces/cv";
import { MimeType, MediaFilesCreationAttributes, MediaType, OwnerType } from "../interfaces/mediaFiles";

const createCVPhotoMediaFileObj = (cvId: number, cv_title: string, userId: number, size?: number)
: Omit<MediaFilesCreationAttributes, 's3_key'> => {
    return {
        user_id: userId,
        owner_id: cvId,
        filename: cv_title,
        owner_type: OwnerType.CV,
        mime_type: MimeType.IMAGE_PNG,
        type: MediaType.CV_PHOTO,
        size: size,
        is_active: true,
    };
}

const createCVPreviewMediaFileObj = (cvId: number, cv_title: string, userId: number, size?: number)
: Omit<MediaFilesCreationAttributes, 's3_key'> => {
    return {
        user_id: userId,
        owner_id: cvId,
        filename: cv_title,
        owner_type: OwnerType.CV,
        mime_type: MimeType.IMAGE_PNG,
        type: MediaType.CV_PREVIEW,
        size: size,
        is_active: true,
    };
}

const createDefaultCVObject = (): Omit<CVCreationAttributes, 'user_id'> => ({
    template: CVTemplates.CASTOR,
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
})

export default {
    createCVPhotoMediaFileObj,
    createCVPreviewMediaFileObj,
    createDefaultCVObject
}