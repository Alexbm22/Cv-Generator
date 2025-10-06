import { PublicCVAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { AppError } from "../middleware/error_middleware";
import { MediaFiles, User } from "../models";
import { CreditsService } from "./credits";
import { S3Service } from "./s3";
import { config } from "../config/env";
import { MediaFilesServices } from "./mediaFiles";
import { MediaTypes, OwnerTypes, PresignedUrlType } from "@/interfaces/mediaFiles";
import { CVsService } from "./cv";
import { downloadRepository } from "@/repositories";
import { SubscriptionService } from "./subscriptions";
import { handleServiceError } from "@/utils/serviceErrorHandler";
import { downloadMappers } from "@/mappers";
import { DownloadValidationResult, DownloadWithMediaFiles } from "@/interfaces/downloads";

const s3Services = new S3Service();

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
        const duplicateDownload = await this.findDuplicateDownload(cvAttributes)
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
            const validationToken = this.generateValidationToken(userRecord.id, cvAttributes);
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

        if (!this.verifyValidationToken(validationToken, userRecord.id, cvAttributes)) {
            throw new AppError(
                "Invalid or expired validation token.",
                403,
                ErrorTypes.UNAUTHORIZED
            );
        }

        // Re-check for race conditions - another process might have created a duplicate
        const duplicateDownload = await this.findDuplicateDownload(cvAttributes);
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

        // Deduct credit/check subscription early to avoid wasted processing
        const hasSubscription = await SubscriptionService.getUserSubscription(userRecord.id);
        if (!hasSubscription) {
            await CreditsService.deductCredit(userRecord.id);
        }

        let downloadRecord;
        let downloadFileMedia;
        let downloadPreviewMedia;

        try {
            // Create download record
            downloadRecord = await downloadRepository.createDownload({
                metadata: cvAttributes,
                fileName: file.originalname,
                origin_id: cvAttributes.id,
                user_id: userRecord.id
            });

            const downloadData = downloadRecord.get();

            // Create media file records
            [downloadFileMedia, downloadPreviewMedia] = await Promise.all([
                MediaFilesServices.create({
                    owner_id: downloadData.id,
                    owner_type: OwnerTypes.DOWNLOAD,
                    type: MediaTypes.DOWNLOAD_FILE,
                    file_name: file.mimetype.split('/')[1]
                }),
                MediaFilesServices.create({
                    owner_id: downloadData.id,
                    owner_type: OwnerTypes.DOWNLOAD,
                    type: MediaTypes.DOWNLOAD_FILE_PREVIEW,
                    file_name: file.mimetype.split('/')[1]
                })
            ]);

            // Handle S3 operations
            await this.handleS3Operations(file, ownedCV, downloadFileMedia, downloadPreviewMedia);

            // Return the download with media files
            const downloadObject = await downloadRepository.getDownloadWithMediaFiles({ id: downloadData.id });
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
            await this.cleanupFailedDownload(downloadRecord, downloadFileMedia, downloadPreviewMedia);
            
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

    private static async handleS3Operations(
        file: Express.Multer.File,
        ownedCV: any,
        downloadFileMedia: MediaFiles,
        downloadPreviewMedia: MediaFiles
    ) {
        // Find the source CV preview media file
        const sourceCVPreview = ownedCV.mediaFiles.find(
            (mediaFile: MediaFiles) => mediaFile.get().type === MediaTypes.CV_PREVIEW
        );

        const operations = [
            // Upload the main file
            s3Services.uploadToS3(
                file,
                downloadFileMedia.get().obj_key,
                config.AWS_S3_BUCKET
            )
        ];

        if (sourceCVPreview) {
            operations.push(
                s3Services.duplicateFile(
                    config.AWS_S3_BUCKET,
                    sourceCVPreview.get().obj_key,
                    downloadPreviewMedia.get().obj_key
                )
            );
        }

        // Execute all S3 operations in parallel
        await Promise.all(operations);
    }

    private static async cleanupFailedDownload(
        downloadRecord?: any,
        downloadFileMedia?: MediaFiles,
        downloadPreviewMedia?: MediaFiles
    ) {
        try {
            // Note: For now, we'll log the cleanup operations
            // In a production environment, you'd want to implement proper cleanup
            if (downloadFileMedia) {
                console.warn('Download file cleanup needed for:', downloadFileMedia.get().obj_key);
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

    /**
     * Checks if a download for the given CV data already exists.
     * Duplicate detection is performed by comparing the core CV attributes
     */
    static async findDuplicateDownload(cvData: PublicCVAttributes) {
        const existingDownloads = await downloadRepository.getDownloadsWithMediaFiles({ origin_id: cvData.id });

        // Exclude non-essential fields from comparison
        const { updatedAt, preview, photo, ...cvAttributes } = cvData;

        return existingDownloads.find((download) => {
            const { updatedAt, preview, photo, ...downloadAttributes } = download.get().metadata;
            return JSON.stringify(downloadAttributes) === JSON.stringify(cvAttributes);
        });
    }

    static async getUserDownloadsPublicData(user: User) {
        const userDownloads = await downloadRepository.getDownloadsWithMediaFiles({ user_id: user.get().id })
        return userDownloads.map(download => {
            return this.getDownloadPublicData(download);
        });
    }

    static async getDownloadPublicData(download: DownloadWithMediaFiles) {
        const downloadData = downloadMappers.extractDownloadMediaFiles(download);

        const publicPhotoData = await MediaFilesServices.getPublicMediaFileData(
            downloadData.DownloadFile, [PresignedUrlType.GET]
        );
        const publicPreviewData = await MediaFilesServices.getPublicMediaFileData(
            downloadData.DownloadPreview, [PresignedUrlType.GET]
        );

        return downloadMappers.mapServerDownloadToPublicDownloadData(
            download.get(), 
            publicPhotoData, 
            publicPreviewData
        );
    }

    @handleServiceError("Error checking download permissions")
    static async hasDownloadPermission(user_id: number) {
        const hasSubscription = await SubscriptionService.getUserSubscription(user_id)
        const userCredits = await CreditsService.getUserCredits(user_id);

        return (!!hasSubscription || userCredits > 0);
    }

    private static generateValidationToken(userId: number, cvAttributes: PublicCVAttributes): string {
        const payload = {
            userId,
            cvId: cvAttributes.id,
            timestamp: Date.now(),
            hash: this.createAttributesHash(cvAttributes)
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    private static verifyValidationToken(token: string, userId: number, cvAttributes: PublicCVAttributes): boolean {
        try {
            const payload = JSON.parse(Buffer.from(token, 'base64').toString());
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 5 * 60 * 1000; // 5 minutes

            return (
                payload.userId === userId &&
                payload.cvId === cvAttributes.id &&
                tokenAge <= maxAge &&
                payload.hash === this.createAttributesHash(cvAttributes)
            );
        } catch {
            return false;
        }
    }

    private static createAttributesHash(cvAttributes: PublicCVAttributes): string {
        const { updatedAt, preview, photo, ...essentialAttributes } = cvAttributes;
        return Buffer.from(JSON.stringify(essentialAttributes)).toString('base64');
    }
}