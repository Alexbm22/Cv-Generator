import { CVWithMediaFiles, PublicCVAttributes, PublicCVMetadataAttributes, ServerCVAttributes } from "@/interfaces/cv";
import { MediaType, PublicMediaFilesAttributes } from "@/interfaces/mediaFiles";
import { randomUUID } from "crypto";

const mapPublicCVToServerCV = (
    cv: PublicCVAttributes, 
    userId: number
): Omit<ServerCVAttributes, 'id' | 'encryptedContent' | 'updatedAt' | 'createdAt'> => {
    return {
        public_id: cv.id ?? randomUUID(),
        title: cv.title,
        jobTitle: cv.jobTitle,
        template: cv.template,
        user_id: userId,
        photo_last_uploaded: cv.photo_last_uploaded,
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
    
const mapServerCVToPublicCV = (
    cv: ServerCVAttributes, 
    photo: PublicMediaFilesAttributes,
    preview: PublicMediaFilesAttributes
): PublicCVAttributes => {
    return {
        photo,
        preview,
        id: cv.public_id,
        title: cv.title,
        photo_last_uploaded: cv.photo_last_uploaded,
        jobTitle: cv.jobTitle,
        template: cv.template,
        updatedAt: cv.updatedAt,
        createdAt: cv.createdAt,
        ...cv.content,
    };
}

const mapServerCVToPublicCVMetadata = (
    cv: ServerCVAttributes, 
    photo: PublicMediaFilesAttributes,
    preview: PublicMediaFilesAttributes
): PublicCVMetadataAttributes => {
    return {
        id: cv.public_id,
        title: cv.title,
        jobTitle: cv.jobTitle,
        template: cv.template,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        photo,
        preview,
    }
}

const extractCVMediaFiles = (cv: CVWithMediaFiles) => {
    const photo = cv.mediaFiles.find(mediaFile => mediaFile.get().type === MediaType.CV_PHOTO)!;
    const preview = cv.mediaFiles.find(mediaFile => mediaFile.get().type === MediaType.CV_PREVIEW)!;

    return {
        CVData: cv,
        CVPhoto: photo,
        CVPreview: preview
    };
}

export default {
    mapPublicCVToServerCV,
    mapServerCVToPublicCV,
    mapServerCVToPublicCVMetadata,
    extractCVMediaFiles
}