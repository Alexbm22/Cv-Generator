import { SubscriptionStatus } from "../interfaces/subscriptions";
import { PublicCVAttributes } from "../interfaces/cv";
import { ErrorTypes } from "../interfaces/error";
import { AppError } from "../middleware/error_middleware";
import { User, CV, Subscription, Download, MediaFiles } from "../models";
import { CreditsService } from "./credits";
import { S3Service } from "./s3";
import { config } from "../config/env";
import { MediaFilesServices } from "./mediaFiles";
import { MediaTypes, OwnerTypes } from "@/interfaces/mediaFiles";
import { CVWithMediaFiles } from "@/models/CV";

const s3Services = new S3Service();

export class DownloadsService {

    /**
     * Initializes a new download for a user's CV.
     * - Verifies ownership of the CV.
     * - Checks download permissions (subscription or credits).
     * - Prevents duplicate downloads.
     * - Creates download record and associated media files.
     * - Duplicates preview if available.
     * - Uploads the downloaded file to S3.
     */
    static async initDownload(user: User, cvAttributes: PublicCVAttributes, file: Express.Multer.File) {
        const userRecord = user.get();

        // Verify user owns the CV
        const ownedCV = await CV.findOne({  
            where: {
                public_id: cvAttributes.id, 
                user_id: userRecord.id
            },
            include: [
                {
                    model: MediaFiles,
                    as: 'mediaFiles'
                }
            ],  
        }) as CVWithMediaFiles;

        if (!ownedCV) {
            throw new AppError(
                "You are not authorized to download this CV.",
                403,
                ErrorTypes.UNAUTHORIZED
            );
        }

        // Ensure user has permission to download (subscription or credits)
        await this.hasDownloadPermission(userRecord.id);

        // Prevent duplicate downloads for the same CV attributes
        const isDuplicate = await this.findDuplicateDownload(cvAttributes);
        if (isDuplicate) return;

        // Create a new download record
        const downloadRecord = await Download.create({
            metadata: cvAttributes,
            fileName: file.originalname,
            origin_id: cvAttributes.id,
            user_id: userRecord.id
        });

        const downloadData = downloadRecord.get();

        // Create media file record for the downloaded file
        const downloadFileMedia = await MediaFilesServices.create({
            owner_id: downloadData.id,
            owner_type: OwnerTypes.DOWNLOAD,
            type: MediaTypes.DOWNLOAD_FILE,
            file_name: file.mimetype.split('/')[1]
        });

        // Create media file record for the download preview
        const downloadPreviewMedia = await MediaFilesServices.create({
            owner_id: downloadData.id,
            owner_type: OwnerTypes.DOWNLOAD,
            type: MediaTypes.DOWNLOAD_FILE_PREVIEW,
            file_name: file.mimetype.split('/')[1]
        });

        // Find the source CV preview media file, if it exists
        const sourceCVPreview = ownedCV.mediaFiles.find(
            mediaFile => mediaFile.get().type === MediaTypes.CV_PREVIEW
        );

        // Duplicate the preview file in S3 if available
        if (sourceCVPreview) {
            await s3Services.duplicateFile(
                config.AWS_S3_BUCKET,
                sourceCVPreview.get().obj_key,
                downloadPreviewMedia.get().obj_key
            );
        }

        // Upload the downloaded file to    
        await s3Services.uploadToS3(
            file,
            downloadFileMedia.get().obj_key,
            config.AWS_S3_BUCKET
        );
    }

    /**
     * Checks if a download for the given CV data already exists.
     * Duplicate detection is performed by comparing the core CV attributes
     */
    static async findDuplicateDownload(cvData: PublicCVAttributes) {
        const existingDownloads = await Download.findAll({
            where: {
                origin_id: cvData.id 
            }
        });

        // Exclude non-essential fields from comparison
        const { updatedAt, preview, photo, ...cvAttributes } = cvData;

        return existingDownloads.find((download) => {
            const { updatedAt, preview, photo, ...downloadAttributes } = download.get().metadata;
            return JSON.stringify(downloadAttributes) === JSON.stringify(cvAttributes);
        });
    }

    static async getUserDownloads(user: User) {
        const userDownloads = await Download.findAll({
            where: {
                user_id: user.get().id
            }
        })

        const publicDowloadsData = userDownloads.map(download => download.toSafeDownload());
        return publicDowloadsData;
    }

    static async getDownloadFileStream(download_id: string) {

        const download = await Download.findOne({
            where: {
                public_id: download_id
            }
        })
        
        if(!download) {
            throw new AppError(
                "The requested file could not be found.",
                404,
                ErrorTypes.NOT_FOUND
            )
        }

        const downloadData = download.get();
        const fileStream = await s3Services.getFromS3(
            downloadData.fileKey,
            config.AWS_S3_BUCKET
        );

        return {
            fileName: downloadData.fileName,
            fileStream
        };
    }

    static async hasDownloadPermission(user_id: number) {
        const hasSubscription = await Subscription.findOne({
            where: {
                user_id,
                status: SubscriptionStatus.ACTIVE
            }
        })
        const userCredits = await CreditsService.getUserCredits(user_id);

        // if the user has an active subscription or enough credits, allow download
        if(hasSubscription) {
            return;
        } else if(userCredits > 0) {
            const consumedCredits = await CreditsService.consumeCredit(user_id, userCredits);
            if(consumedCredits) {
                return;
            }
        } else {
            throw new AppError(
                "You do not have download permissions. Please subscribe or purchase credits.",
                403,
                ErrorTypes.UNAUTHORIZED
            )
        }
    } 
}