import { PublicCVAttributes, ServerCVAttributes, PublicCVMetadataAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { UserAttributes } from "../interfaces/user";
import { AppError } from "../middleware/error_middleware";
import { CV, MediaFiles } from "../models";
import { MediaFilesServices } from "./mediaFiles";
import cvRepository from '../repositories/cv';
import cvMapper from '../mappers/cv';
import cvFactories from '../factories/cv';
import { handleServiceError } from '../utils/serviceErrorHandler';

export class CVsService {
    @handleServiceError('Failed to create CVs')
    static async createCVs(
        userId: number, 
        publicCVs: PublicCVAttributes[], 
    ) {
        const serverCVs = publicCVs.map(cv => cvMapper.mapPublicCVToServerCV(cv, userId));
        const createdCVs = await cvRepository.createCVs(serverCVs);

        const photoMediaFileObjs = createdCVs.map(cv => cvFactories.createCVPhotoMediaFileObj(cv.get().id, cv.get().title));
        const createdPhotos = await MediaFilesServices.bulkCreate(photoMediaFileObjs);

        const previewMediaFileObjs = createdCVs.map(cv => cvFactories.createCVPreviewMediaFileObj(cv.get().id, cv.get().title));
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

        return await Promise.all(result.map(async (cv) => await CVsService.getCVMetadata(
            cv.CVData.get(),  
            cv.CVPreview, 
            cv.CVPhoto
        )));
    }

    @handleServiceError('CV creation failed')
    static async createCV(userId: number) {
        const cv = await cvRepository.createCV(userId);
        const photo = await MediaFilesServices.create(cvFactories.createCVPhotoMediaFileObj(cv.id, cv.get().title));
        const preview = await MediaFilesServices.create(cvFactories.createCVPreviewMediaFileObj(cv.id, cv.get().title));
        return await this.getPublicCVData(cv, preview, photo);
    }
    
    @handleServiceError('CV syncing failed')
    static async syncCV(
        userId: number, 
        updatedPublicCV: PublicCVAttributes
    ) {
        const existingCV = await cvRepository.getCVWithMediaFiles(userId, updatedPublicCV.id);
        const updatedServerCV = cvMapper.mapPublicCVToServerCV(updatedPublicCV, userId) as ServerCVAttributes; 
        
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
            await cvRepository.updateCV(existingCV, updatedFields);
        }

        return updatedFields;
    }

    @handleServiceError('CV deletion failed')
    static async deleteCV(
        user: UserAttributes, 
        cvPublicId: string, 
    ): Promise<void> {
        const deletedCount = await cvRepository.deleteCV(user.id, cvPublicId);
        
        if(deletedCount <= 0) {
            throw new AppError(
                'Something went wrong. Please contact support.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }   
    }
    
    
    static async getCVWithMediaFiles(userId: number, cvPublicId: string) {
        return await cvRepository.getCVWithMediaFiles(userId, cvPublicId);
    }

    @handleServiceError('CV details fetch failed')
    static async getDetailedCV(userId: number, cvPublicId: string) {
        const cv = await this.getCVWithMediaFiles(userId, cvPublicId);

        if (!cv) {
            throw new AppError('CV not found.', 404, ErrorTypes.NOT_FOUND);
        }
        if (!cv.mediaFiles) {
            throw new AppError("No media files found", 404, ErrorTypes.NOT_FOUND);
        }

        const cvWithMediaFiles = cvMapper.extractCVMediaFiles(cv);
        
        return await this.getPublicCVData(
            cvWithMediaFiles.CVData,
            cvWithMediaFiles.CVPreview,
            cvWithMediaFiles.CVPhoto
        );
    }

    static async getPublicCVData(cvData: CV, cvPreview: MediaFiles, cvPhoto: MediaFiles) {
        const publicPhotoData = await MediaFilesServices.getPublicMediaFileData(cvPhoto);
        const publicPreviewData = await MediaFilesServices.getPublicMediaFileData(cvPreview);
        
        return cvMapper.mapServerCVToPublicCV(cvData.get(), publicPhotoData, publicPreviewData);
    }
    
    @handleServiceError('CVs metadata fetch failed')
    static async getAllCVsMetadata(userId: number) {
        const cvs = await cvRepository.getCVsWithMediaFiles(userId);
        
        const cvWithMediaFiles = cvs.map(cv => cvMapper.extractCVMediaFiles(cv));
        const cvsMetaData = cvWithMediaFiles.map((cv) => 
            CVsService.getCVMetadata(cv.CVData.get(), cv.CVPreview, cv.CVPhoto)
        )

        return Promise.all(cvsMetaData);
    }

    static async getCVMetadata(cv: ServerCVAttributes, preview: MediaFiles, photo: MediaFiles): Promise<PublicCVMetadataAttributes> {
        const publicPreview = await MediaFilesServices.getPublicMediaFileData(preview);
        const publicPhoto = await MediaFilesServices.getPublicMediaFileData(photo);

        return cvMapper.mapServerCVToPublicCVMetadata(cv, publicPhoto, publicPreview);
    }
}