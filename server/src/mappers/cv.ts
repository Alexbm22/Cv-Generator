import { CVSummaryAttributes, CVWithMediaFiles, PublicCVAttributes, PublicCVMetadataAttributes, ServerCVAttributes } from "@/interfaces/cv";
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
        jobDescription: cv.jobDescription,
        companyName: cv.companyName,
        template: cv.template,
        user_id: userId,
        photo_last_uploaded: cv.photo_last_uploaded,
        sectionsOrder: cv.sectionsOrder,
        templateColor: cv.templateColor,
        language: cv.language,
        detectedLanguage: cv.detectedLanguage,
        content: {
            aboutMe: cv.aboutMe,
            languages: cv.languages,
            skills: cv.skills,
            workExperience: cv.workExperience,
            education: cv.education,
            projects: cv.projects,
            customSections: cv.customSections,
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
    photoId: string,
    previewId: string
): PublicCVAttributes => {
    return {
        photoId,
        previewId,
        id: cv.public_id,
        title: cv.title,
        photo_last_uploaded: cv.photo_last_uploaded,
        jobTitle: cv.jobTitle,
        jobDescription: cv.jobDescription,
        companyName: cv.companyName,
        template: cv.template,
        language: cv.language,
        detectedLanguage: cv.detectedLanguage,
        templateColor: cv.templateColor,
        updatedAt: cv.updatedAt,
        createdAt: cv.createdAt,
        sectionsOrder: cv.sectionsOrder,
        ...cv.content,
    };
}

const mapServerCVToPublicCVSummary = (
    cv: ServerCVAttributes, 
    previewId: string
): CVSummaryAttributes => {
    return {
        id: cv.public_id,
        title: cv.title,
        previewId,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt
    };
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

export const mapServerCVToAiOptimizedCVContent = (cv: ServerCVAttributes) => {
    const { title,  template, templateColor } = cv;
    return {
        title,
        template,
        templateColor,
        ...cv.content,
    };
}

export default {
    mapPublicCVToServerCV,
    mapServerCVToPublicCV,
    mapServerCVToPublicCVSummary,
    extractCVMediaFiles
}