import { CVCreationAttributes, PublicCVAttributes, ServerCVAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { AppError } from "../middleware/error_middleware";
import { CV, MediaFiles, User } from "../models";
import { CreditsService } from "./credits";
import { S3Service } from "./s3";
import { config } from "../config/env";
import { MediaFilesServices } from "./mediaFiles";
import { FileType, MediaType, OwnerType, PresignedUrlType } from "@/interfaces/mediaFiles";
import { CVsService } from "./cv";
import { downloadRepository } from "@/repositories";
import { SubscriptionService } from "./subscriptions";
import { handleServiceError } from "@/utils/serviceErrorHandler";
import { cvMappers, downloadMappers } from "@/mappers";
import { DownloadValidationResult, DownloadWithMediaFiles, DownloadMetadataCVAttributes } from "@/interfaces/downloads";
import { DownloadValidationTokenService } from "./tokens/DownloadValidationService";

const s3Service = new S3Service();
const ValidationTokenService = new DownloadValidationTokenService();

export class DownloadsService {

    @handleServiceError("Download Validation Failed")
    static async validateDownload(user: User, cvAttributes: PublicCVAttributes): Promise<DownloadValidationResult> {
        const userRecord = user.get();
    
        const ownedCV = await CVsService.getCVWithMediaFiles(userRecord.id, cvAttributes.id);
        if(!ownedCV) {
            throw new AppError(
                "You are not authorized to download this CV.",
                403,
                ErrorTypes.UNAUTHORIZED
            );
        }

        // Prevent duplicate downloads for the same CV attributes
        const duplicateDownload = await this.findDuplicateDownload(cvAttributes, userRecord.id)
        if (duplicateDownload) {
            const duplicateDownloadData = await this.getDownloadPublicData(duplicateDownload);
            return {
                isDuplicate: true,
                existingDownload: duplicateDownloadData,
                hasPermission: true
            }
        }

        // Ensure user has permission to download (subscription or credits)
        if(await this.hasDownloadPermission(userRecord.id)) {
            const validationToken = ValidationTokenService.generateToken(userRecord.id, cvAttributes);
            return {
                isDuplicate: false,
                hasPermission: true,
                validationToken
            };
        } else {
            return {
                isDuplicate: false,
                hasPermission: false
            }
        }
    } 

    @handleServiceError("Download Execution Failed")
    static async executeDownload(
        user: User, 
        cvAttributes: PublicCVAttributes, 
        validationToken: string, 
        file: Express.Multer.File
    ) {
        const userRecord = user.get();

        if (!ValidationTokenService.verifyToken(validationToken, userRecord.id, cvAttributes)) {
            throw new AppError(
                "Invalid or expired validation token.",
                403,
                ErrorTypes.UNAUTHORIZED
            );
        }

        // Re-check for race conditions - another process might have created a duplicate
        const duplicateDownload = await this.findDuplicateDownload(cvAttributes, userRecord.id);
        if (duplicateDownload) {
            return await this.getDownloadPublicData(duplicateDownload);
        }

        // Verify ownership and get CV data
        const ownedCV = await CVsService.getCVWithMediaFiles(userRecord.id, cvAttributes.id);
        if (!ownedCV) {
            throw new AppError(
                "CV not found or you are not authorized to download it.",
                403,
                ErrorTypes.UNAUTHORIZED
            );
        }

        const ownedCVData = cvMappers.extractCVMediaFiles(ownedCV);

        // Extract metadata (same structure as DownloadMetadataCVAttributes)
        const cvRawData = ownedCV.get();
        const cvMetadata: DownloadMetadataCVAttributes = {
            user_id: cvRawData.user_id,
            photo_last_uploaded: cvRawData.photo_last_uploaded,
            jobTitle: cvRawData.jobTitle,
            title: cvRawData.title,
            template: cvRawData.template,
            content: cvRawData.content
        };

        // Deduct credit/check subscription early to avoid wasted processing
        const hasSubscription = await SubscriptionService.getUserSubscription(userRecord.id);
        if (!hasSubscription) {
            await CreditsService.deductCredit(userRecord.id);
        }

        let downloadRecord;
        let downloadFileMedia;
        let downloadPreviewMedia;
        let downloadPhotoMedia;

        try {
            // Create download record
            const downloadRecord = await downloadRepository.createDownload({
                metadata: cvMetadata,
                fileName: `${cvAttributes.title}.pdf`,
                origin_id: cvAttributes.id,
                user_id: userRecord.id
            });

            // Create media file records
            [downloadFileMedia, downloadPreviewMedia, downloadPhotoMedia] = await Promise.all([
                MediaFilesServices.create({
                    owner_id: downloadRecord.id,
                    owner_type: OwnerType.DOWNLOAD,
                    type: MediaType.DOWNLOAD_FILE,
                    file_type: FileType.PDF,
                    file_name: file.originalname
                }),
                MediaFilesServices.duplicateMediaFile(
                    {
                        owner_id: downloadRecord.id,
                        owner_type: OwnerType.DOWNLOAD,
                        type: MediaType.DOWNLOAD_FILE_PREVIEW,
                        file_type: FileType.PNG,
                        file_name: file.originalname
                    }, 
                    ownedCVData.CVPreview.get()
                ),
                MediaFilesServices.duplicateMediaFile(
                    {
                        owner_id: downloadRecord.id,
                        owner_type: OwnerType.DOWNLOAD,
                        type: MediaType.DOWNLOAD_FILE_PHOTO,
                        file_type: FileType.PNG,
                        file_name: file.originalname
                    }, 
                    ownedCVData.CVPhoto.get()
                )
            ]);

            // Upload the main file
            await s3Service.uploadToS3(
                file,
                downloadFileMedia.get().obj_key,
                config.AWS_S3_BUCKET
            )

            // Return the download with media files
            const downloadObject = await downloadRepository.getDownloadWithMediaFiles({ id: downloadRecord.id });
            if (!downloadObject) {
                throw new AppError(
                    "Download record not found after creation.",
                    500,
                    ErrorTypes.INTERNAL_ERR
                );
            }

            return await this.getDownloadPublicData(downloadObject);

        } catch (error) {
            // Cleanup on failure
            await this.cleanupFailedDownload(downloadRecord, downloadFileMedia, downloadPreviewMedia, downloadPhotoMedia);
            
            // Refund credit if it was deducted
            if (!hasSubscription) {
                try {
                    await CreditsService.addCredits(userRecord.id, 1);
                } catch (refundError) {
                    console.error('Failed to refund credit after download failure:', refundError);
                }
            }
            
            throw error;
        }
    }

    @handleServiceError("Download Duplication Failed")
    static async duplicateDownload(
        user: User,
        downloadId: string
    ) {
        const originalDownload = await downloadRepository.getDownloadWithMediaFiles({ public_id: downloadId });
        if(!originalDownload) {
            throw new AppError(
                "Original download not found.",
                404,
                ErrorTypes.NOT_FOUND
            );
        }
        const { DownloadPreview, DownloadPhoto } = downloadMappers.extractDownloadMediaFiles(originalDownload);

        const cvData = originalDownload.get().metadata;

        const duplicatedCV = await CVsService.duplicateCV(
            cvData,
            DownloadPreview,
            DownloadPhoto
        )

        return duplicatedCV;
    }

    private static async cleanupFailedDownload(
        downloadRecord?: any,
        downloadFileMedia?: MediaFiles,
        downloadPreviewMedia?: MediaFiles,
        downloadPhotoMedia?: MediaFiles
    ) {
        try {
            // Note: For now, we'll log the cleanup operations
            // In a production environment, you'd want to implement proper cleanup
            if (downloadFileMedia) {
                console.warn('Download file cleanup needed for:', downloadFileMedia.get().obj_key);
            }

            if (downloadPhotoMedia) {
                console.warn('Download file cleanup needed for:', downloadPhotoMedia.get().obj_key);
            }

            if (downloadPreviewMedia) {
                console.warn('Preview file cleanup needed for:', downloadPreviewMedia.get().obj_key);
            }

            if (downloadRecord) {
                console.warn('Download record cleanup needed for ID:', downloadRecord.get().id);
            }

            // TODO: Implement proper S3 file deletion and database cleanup
            // This would require adding deleteFile method to S3Service
            // and deleteDownload method to downloadRepository
        } catch (error: any) {
            console.error('Cleanup failed:', error);
        }
    }

    @handleServiceError("Download Deletion Failed")
    static async deleteDownload(user: User, downloadId: string) {
        const deletedCount = await downloadRepository.deleteDownload(user.get().id, downloadId);
                
        if(deletedCount <= 0) {
            throw new AppError(
                'Something went wrong. Please contact support.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }  
    }

    @handleServiceError("Downloads Deletion Failed")
    static async deleteUserDownloads(user_id: number) {
        const deletedCount = await downloadRepository.deleteDownload(user_id);
                
        if(deletedCount <= 0) {
            throw new AppError(
                'Something went wrong. Please contact support.',
                400,
                ErrorTypes.BAD_REQUEST
            );
        }  
    }

    /**
     * Checks if a download for the given CV data already exists for the specific user.
     * Duplicate detection is performed by comparing the core CV attributes
     */
    static async findDuplicateDownload(cvData: PublicCVAttributes, userId: number) {
        const existingDownloads = await downloadRepository.getDownloadsWithMediaFiles({ 
            origin_id: cvData.id,
            user_id: userId 
        });

        if (existingDownloads.length === 0) {
            return null;
        }

        // Create the candidate metadata structure to compare
        const candidateMetadata: DownloadMetadataCVAttributes = {
            user_id: userId,
            photo_last_uploaded: cvData.photo_last_uploaded,
            jobTitle: cvData.jobTitle,
            title: cvData.title,
            template: cvData.template,
            content: {
                firstName: cvData.firstName,
                lastName: cvData.lastName,
                email: cvData.email,
                phoneNumber: cvData.phoneNumber,
                address: cvData.address,
                birthDate: cvData.birthDate,
                socialLinks: cvData.socialLinks,
                professionalSummary: cvData.professionalSummary,
                languages: cvData.languages,
                skills: cvData.skills,
                workExperience: cvData.workExperience,
                education: cvData.education,
                projects: cvData.projects,
                customSections: cvData.customSections,
                sectionsOrder: cvData.sectionsOrder
            }
        };

        // Find exact match by comparing each field
        return existingDownloads.find((download) => {
            const downloadMetadata = download.get().metadata;
            
            // Compare top-level fields
            if (downloadMetadata.user_id !== candidateMetadata.user_id ||
                downloadMetadata.jobTitle !== candidateMetadata.jobTitle ||
                downloadMetadata.title !== candidateMetadata.title ||
                downloadMetadata.template !== candidateMetadata.template) {
                return false;
            }

            const downloadPhotoDate = downloadMetadata.photo_last_uploaded;
            const candidatePhotoDate = candidateMetadata.photo_last_uploaded;
            
            // Both null/undefined - consider equal
            if (!downloadPhotoDate && !candidatePhotoDate) {
                // Continue to content comparison
            }
            // One is null/undefined, other is not - not equal
            else if (!downloadPhotoDate || !candidatePhotoDate) {
                return false;
            }
            // Both have values - convert to timestamps for comparison
            else {
                if(JSON.stringify(downloadPhotoDate) !== JSON.stringify(candidatePhotoDate)) {
                    return false;
                }
            }

            // Deep comparison of content (which is more stable than JSON.stringify)
            return JSON.stringify(downloadMetadata.content) === JSON.stringify(candidateMetadata.content);
        });
    }

    static async getUserDownloadsPublicData(user: User) {
        const userDownloads = await downloadRepository.getDownloadsWithMediaFiles({ user_id: user.get().id })
        return Promise.all(userDownloads.map(async download => {
            return await this.getDownloadPublicData(download);
        }));
    }

    static async getDownloadPublicData(download: DownloadWithMediaFiles) {
        const downloadData = downloadMappers.extractDownloadMediaFiles(download);

        const publicFileData = await MediaFilesServices.getPublicMediaFileData(
            downloadData.DownloadFile, [PresignedUrlType.GET]
        );
        const publicPreviewData = await MediaFilesServices.getPublicMediaFileData(
            downloadData.DownloadPreview, [PresignedUrlType.GET]
        );

        const publicPhotoData = await MediaFilesServices.getPublicMediaFileData(
            downloadData.DownloadPhoto, [PresignedUrlType.GET]
        );
        

        return downloadMappers.mapServerDownloadToPublicDownloadData(
            download.get(), 
            publicFileData, 
            publicPreviewData,
            publicPhotoData
        );
    }

    @handleServiceError("Error checking download permissions")
    static async hasDownloadPermission(user_id: number) {
        const hasSubscription = await SubscriptionService.getUserSubscription(user_id)
        const userCredits = await CreditsService.getUserCredits(user_id);

        return (!!hasSubscription || userCredits > 0);
    }
}