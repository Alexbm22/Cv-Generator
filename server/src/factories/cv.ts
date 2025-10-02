import { CVCreationAttributes, CVTemplates } from "../interfaces/cv";
import { MediaFilesCreationAttributes, MediaTypes, OwnerTypes } from "../interfaces/mediaFiles";

const createCVPhotoMediaFileObj = (cvId: number, cv_title: string): Omit<MediaFilesCreationAttributes, 'obj_key'> => {
    return {
        owner_id: cvId,
        file_name: cv_title,
        owner_type: OwnerTypes.CV,
        type: MediaTypes.CV_PHOTO,
    };
}

const createCVPreviewMediaFileObj = (cvId: number, cv_title: string): Omit<MediaFilesCreationAttributes, 'obj_key'> => {
    return {
        owner_id: cvId,
        file_name: cv_title,
        owner_type: OwnerTypes.CV,
        type: MediaTypes.CV_PREVIEW,
    };
}

const createDefaultCVObject = (): Omit<CVCreationAttributes, 'user_id'> => ({
    jobTitle: '',
    title: '',
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