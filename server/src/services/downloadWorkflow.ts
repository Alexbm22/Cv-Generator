import { createHash } from 'crypto';
import { Transaction } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '@/config/DB/database_config';
import { CVSnapshot, Download, DownloadCredits, MediaFiles, User } from '@/models';
import { CVsService } from '@/services/cv';
import { SubscriptionService } from '@/services/subscriptions';
import S3Service from '@/services/s3';
import { config } from '@/config/env';
import { ActionLogService } from '@/services/actionLog';
import { AppError } from '@/middleware/error_middleware';
import { ErrorTypes } from '@/interfaces/error';
import { DownloadStatus, DownloadWithMediaFiles, PublicDownloadData } from '@/interfaces/downloads';
import { MediaType, MimeType, OwnerType } from '@/interfaces/mediaFiles';
import { cvMappers, downloadMappers } from '@/mappers';
import { generateS3ObjKey } from '@/utils/mediaFiles';
import { generateUUID } from '@/utils/uuid';
import { MediaFilesServices } from '@/services/mediaFiles';

const PENDING_DOWNLOAD_TTL_MS = 15 * 60 * 1000;

export type DownloadPreparation =
    | { kind: 'reuse'; download: PublicDownloadData }
    | { kind: 'pending'; actionId: string; downloadId: string; expiresAt: number }
    | {
        kind: 'prepared';
        actionId: string;
        downloadId: string;
        fileName: string;
        pdf: { putUrl: string; expiresAt: number; requiredContentType: MimeType.APPLICATION_PDF };
    };

const canonicalize = (value: unknown): unknown => {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, item]) => [key, canonicalize(item)]));
    }
    return value;
};

const toHash = (value: unknown) => createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');

export class DownloadWorkflowService {
    static async prepare(user: User, cvId: string): Promise<DownloadPreparation> {
        const userId = user.get().id;
        const cv = await CVsService.getCVWithMediaFiles(userId, cvId);
        if (!cv) {
            throw new AppError('CV not found or you are not authorized to download it.', 404, ErrorTypes.NOT_FOUND);
        }

        const cvData = cv.get();
        const { CVPhoto, CVPreview } = cvMappers.extractCVMediaFiles(cv);
        const photo = CVPhoto?.get();
        const snapshotHash = toHash({
            sourceCvId: cvData.public_id,
            title: cvData.title,
            template: cvData.template,
            templateColor: cvData.templateColor,
            jobTitle: cvData.jobTitle,
            jobDescription: cvData.jobDescription,
            companyName: cvData.companyName,
            language: cvData.language,
            detectedLanguage: cvData.detectedLanguage,
            sectionsOrder: cvData.sectionsOrder,
            content: cvData.content,
            photo: photo ? {
                publicId: photo.public_id,
                s3Key: photo.s3_key,
                updatedAt: photo.updatedAt,
                size: photo.size,
                mimeType: photo.mime_type
            } : null
        });

        const existing = await this.findByHash(userId, cvId, snapshotHash);
        if (existing?.get().status === DownloadStatus.COMPLETED) {
            return { kind: 'reuse', download: await this.toPublicDownload(await this.getWithMedia(existing.get().id)) };
        }
        if (existing) {
            return this.toPending(existing);
        }

        if (!await this.hasDownloadRights(userId)) {
            throw new AppError('A subscription or available credit is required to download.', 403, ErrorTypes.UNAUTHORIZED);
        }

        const actionId = generateUUID();
        const expiresAt = new Date(Date.now() + PENDING_DOWNLOAD_TTL_MS);
        try {
            await sequelize.transaction(async transaction => {
                const concurrent = await this.findByHash(userId, cvId, snapshotHash, transaction);
                if (concurrent) {
                    return;
                }

                const createdSnapshot = await CVSnapshot.create({
                    user_id: userId,
                    origin_id: cvId,
                    snapshot_hash: snapshotHash,
                    title: cvData.title,
                    template: cvData.template,
                    templateColor: cvData.templateColor,
                    content: JSON.stringify(cvData.content),
                    sectionsOrder: cvData.sectionsOrder,
                    jobTitle: cvData.jobTitle,
                    jobDescription: cvData.jobDescription,
                    companyName: cvData.companyName,
                    language: cvData.language,
                    detectedLanguage: cvData.detectedLanguage
                }, { transaction });
                const snapshot = await CVSnapshot.findOne({
                    where: {
                        public_id: createdSnapshot.getDataValue('public_id'),
                        user_id: userId
                    },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (!snapshot) {
                    throw new Error('CV snapshot could not be reloaded after creation.');
                }
                const snapshotId = snapshot.getDataValue('id');
                if (!Number.isInteger(snapshotId)) {
                    throw new Error('CV snapshot was created without a database primary key.');
                }

                const download = await Download.create({
                    user_id: userId,
                    origin_id: cvId,
                    snapshot_id: snapshotId,
                    snapshot_hash: snapshotHash,
                    status: DownloadStatus.PENDING,
                    action_id: actionId,
                    pending_expires_at: expiresAt,
                    completed_at: null,
                    fileName: `${cvData.title}.pdf`,
                    metadata: {
                        user_id: userId,
                        photo_last_uploaded: cvData.photo_last_uploaded,
                        title: cvData.title,
                        jobTitle: cvData.jobTitle,
                        jobDescription: cvData.jobDescription,
                        companyName: cvData.companyName,
                        template: cvData.template,
                        templateColor: cvData.templateColor,
                        language: cvData.language,
                        detectedLanguage: cvData.detectedLanguage,
                        sectionsOrder: cvData.sectionsOrder,
                        content: cvData.content
                    }
                }, { transaction });

                await Promise.all([
                    MediaFiles.create({
                        user_id: userId,
                        owner_id: snapshotId,
                        owner_type: OwnerType.CV_SNAPSHOT,
                        type: MediaType.CV_PHOTO,
                        mime_type: photo.mime_type,
                        filename: photo.filename,
                        s3_key: generateS3ObjKey(OwnerType.CV_SNAPSHOT, snapshotId, MediaType.CV_PHOTO, photo.filename, photo.mime_type),
                        is_active: false,
                        size: photo.size
                    }, { transaction }),
                    MediaFiles.create({
                        user_id: userId,
                        owner_id: download.id,
                        owner_type: OwnerType.DOWNLOAD,
                        type: MediaType.DOWNLOAD_FILE_PREVIEW,
                        mime_type: CVPreview.get().mime_type,
                        filename: CVPreview.get().filename,
                        s3_key: generateS3ObjKey(OwnerType.DOWNLOAD, download.id, MediaType.DOWNLOAD_FILE_PREVIEW, CVPreview.get().filename, CVPreview.get().mime_type),
                        is_active: false,
                        size: CVPreview.get().size
                    }, { transaction }),
                    MediaFiles.create({
                        user_id: userId,
                        owner_id: download.id,
                        owner_type: OwnerType.DOWNLOAD,
                        type: MediaType.DOWNLOAD_FILE,
                        mime_type: MimeType.APPLICATION_PDF,
                        filename: `${cvData.title}.pdf`,
                        s3_key: generateS3ObjKey(OwnerType.DOWNLOAD, download.id, MediaType.DOWNLOAD_FILE, `${cvData.title}.pdf`, MimeType.APPLICATION_PDF),
                        is_active: false,
                        size: null
                    }, { transaction })
                ]);
            });

            const preparedDownload = await this.findByHash(userId, cvId, snapshotHash);
            if (!preparedDownload) throw new Error('Download preparation did not create a record.');
            if (preparedDownload.get().status === DownloadStatus.COMPLETED) {
                return { kind: 'reuse', download: await this.toPublicDownload(await this.getWithMedia(preparedDownload.get().id)) };
            }
            if (preparedDownload.get().action_id !== actionId) return this.toPending(preparedDownload);
            const preparedSnapshot = await CVSnapshot.findByPk(preparedDownload.get().snapshot_id);
            if (!preparedSnapshot) throw new Error('Download snapshot is missing.');

            const media = await MediaFiles.findAll({ where: { user_id: userId } });
            const snapshotPhoto = media.find(item => item.get().owner_type === OwnerType.CV_SNAPSHOT && item.get().owner_id === preparedSnapshot.get().id);
            const preview = media.find(item => item.get().owner_id === preparedDownload.get().id && item.get().type === MediaType.DOWNLOAD_FILE_PREVIEW);
            const pdf = media.find(item => item.get().owner_id === preparedDownload.get().id && item.get().type === MediaType.DOWNLOAD_FILE);
            if (!snapshotPhoto || !preview || !pdf) throw new Error('Download media preparation failed.');

            const [snapshotPhotoCopy, previewCopy] = await Promise.allSettled([
                S3Service.duplicateFile(config.AWS_S3_BUCKET, photo.s3_key, snapshotPhoto.get().s3_key),
                S3Service.duplicateFile(config.AWS_S3_BUCKET, CVPreview.get().s3_key, preview.get().s3_key)
            ]);

            await Promise.all([
                ...(snapshotPhotoCopy.status === 'fulfilled' ? [snapshotPhoto.update({ is_active: true })] : []),
                ...(previewCopy.status === 'fulfilled' ? [preview.update({ is_active: true })] : [])
            ]);

            const signedUpload = await S3Service.generatePresignedPutUrl(
                pdf.get().s3_key,
                config.AWS_S3_BUCKET,
                5 * 60,
                MimeType.APPLICATION_PDF
            );
            return {
                kind: 'prepared',
                actionId,
                downloadId: preparedDownload.get().public_id,
                fileName: preparedDownload.get().fileName,
                pdf: {
                    putUrl: signedUpload.url,
                    expiresAt: signedUpload.expiresAt,
                    requiredContentType: MimeType.APPLICATION_PDF
                }
            };
        } catch (error) {
            const failedDownload = await this.findByHash(userId, cvId, snapshotHash);
            if (failedDownload && failedDownload.get().action_id !== actionId) {
                return failedDownload.get().status === DownloadStatus.COMPLETED
                    ? { kind: 'reuse', download: await this.toPublicDownload(await this.getWithMedia(failedDownload.get().id)) }
                    : this.toPending(failedDownload);
            }
            if (failedDownload?.get().action_id === actionId) {
                await this.failPending(userId, failedDownload.get().public_id, actionId, 'server_prepare', error);
            }
            throw error;
        }
    }

    static async complete(user: User, downloadId: string, actionId: string): Promise<PublicDownloadData> {
        const userId = user.get().id;
        const download = await Download.findOne({ where: { user_id: userId, public_id: downloadId } });
        if (!download) throw new AppError('Download not found.', 404, ErrorTypes.NOT_FOUND);
        if (download.get().action_id !== actionId) throw new AppError('Invalid download action.', 403, ErrorTypes.UNAUTHORIZED);
        if (download.get().status === DownloadStatus.COMPLETED) return this.toPublicDownload(await this.getWithMedia(download.get().id));

        try {
            const pdf = await MediaFiles.findOne({ where: { owner_id: download.get().id, owner_type: OwnerType.DOWNLOAD, type: MediaType.DOWNLOAD_FILE } });
            if (!pdf) throw new Error('Pending PDF media file is missing.');
            const metadata = await S3Service.getObjectMetadata(pdf.get().s3_key, config.AWS_S3_BUCKET);
            if (metadata.contentLength <= 0 || metadata.contentType !== MimeType.APPLICATION_PDF) {
                throw new Error('Uploaded file is not a non-empty application/pdf object.');
            }

            await sequelize.transaction(async transaction => {
                const locked = await Download.findOne({
                    where: { id: download.get().id, user_id: userId },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (!locked) throw new Error('Download disappeared during completion.');
                if (locked.get().status === DownloadStatus.COMPLETED) return;
                const expiresAt = locked.get().pending_expires_at;
                if (locked.get().action_id !== actionId || !expiresAt || expiresAt < new Date()) {
                    throw new Error('Download action has expired.');
                }

                if (!await SubscriptionService.getUserSubscription(userId)) {
                    const credits = await DownloadCredits.findOne({ where: { user_id: userId }, transaction, lock: transaction.LOCK.UPDATE });
                    if (!credits || credits.get().credits <= 0) {
                        throw new AppError('Insufficient credits available for this operation.', 403, ErrorTypes.UNAUTHORIZED);
                    }
                    await credits.update({ credits: credits.get().credits - 1 }, { transaction });
                }

                await pdf.update({ is_active: true, size: metadata.contentLength }, { transaction });
                await locked.update({
                    status: DownloadStatus.COMPLETED,
                    completed_at: new Date(),
                    pending_expires_at: null
                }, { transaction });
            });
            return this.toPublicDownload(await this.getWithMedia(download.get().id));
        } catch (error) {
            await this.failPending(userId, downloadId, actionId, 'completion', error);
            throw error;
        }
    }

    static async fail(user: User, downloadId: string, actionId: string, failureType: string, message?: string) {
        return this.failPending(user.get().id, downloadId, actionId, 'client_failure', new Error(message || failureType), failureType);
    }

    static async duplicateCompletedVersion(user: User, downloadId: string) {
        const download = await Download.findOne({
            where: {
                user_id: user.get().id,
                public_id: downloadId,
                status: DownloadStatus.COMPLETED
            },
            include: [{ model: MediaFiles, as: 'mediaFiles' }, {
                model: CVSnapshot,
                as: 'snapshot',
                include: [{ model: MediaFiles, as: 'mediaFiles' }]
            }]
        }) as DownloadWithMediaFiles | null;
        if (!download) {
            throw new AppError('Completed download not found.', 404, ErrorTypes.NOT_FOUND);
        }

        const snapshot = (download as unknown as { snapshot?: CVSnapshot & { mediaFiles?: MediaFiles[] } }).snapshot;
        const preview = download.mediaFiles.find(media => media.get().type === MediaType.DOWNLOAD_FILE_PREVIEW);
        const photo = snapshot?.mediaFiles?.find(media => media.get().type === MediaType.CV_PHOTO);
        if (!snapshot || !preview || !photo) {
            throw new Error('Completed download snapshot media is incomplete.');
        }

        const snapshotData = snapshot.get();
        return CVsService.duplicateCV({
            user_id: user.get().id,
            title: snapshotData.title,
            jobTitle: snapshotData.jobTitle,
            jobDescription: snapshotData.jobDescription,
            companyName: snapshotData.companyName,
            template: snapshotData.template,
            templateColor: snapshotData.templateColor,
            sectionsOrder: snapshotData.sectionsOrder,
            content: JSON.parse(snapshotData.content),
            language: snapshotData.language ?? 'en',
            detectedLanguage: snapshotData.detectedLanguage,
            photo_last_uploaded: null
        }, preview, photo);
    }

    static async getCompletedDownloads(user: User): Promise<PublicDownloadData[]> {
        const downloads = await Download.findAll({
            where: { user_id: user.get().id, status: DownloadStatus.COMPLETED },
            order: [['createdAt', 'DESC']]
        });
        return Promise.all(downloads.map(async download =>
            this.toPublicDownload(await this.getWithMedia(download.get().id))
        ));
    }

    static async deleteCompletedDownload(user: User, downloadId: string): Promise<void> {
        const download = await Download.findOne({
            where: { user_id: user.get().id, public_id: downloadId, status: DownloadStatus.COMPLETED }
        });
        if (!download) {
            throw new AppError('Completed download not found.', 404, ErrorTypes.NOT_FOUND);
        }

        const snapshotId = download.get().snapshot_id;
        await download.destroy();
        if (await Download.count({ where: { snapshot_id: snapshotId } }) === 0) {
            const snapshot = await CVSnapshot.findByPk(snapshotId);
            await snapshot?.destroy();
        }
    }

    static async cleanupExpiredPendingDownloads(): Promise<void> {
        const expiredDownloads = await Download.findAll({
            where: {
                status: DownloadStatus.PENDING,
                pending_expires_at: { [Op.lt]: new Date() }
            },
            limit: 50
        });

        for (const download of expiredDownloads) {
            const data = download.get();
            await this.failPending(
                data.user_id,
                data.public_id,
                data.action_id,
                'ttl_sweeper',
                new Error('Pending download expired before completion.'),
                'pending_timeout'
            );
        }
    }

    private static async failPending(
        userId: number,
        downloadId: string,
        actionId: string,
        trigger: 'client_failure' | 'server_prepare' | 'completion' | 'ttl_sweeper',
        error: unknown,
        failureType = 'unknown'
    ) {
        const download = await Download.findOne({ where: { user_id: userId, public_id: downloadId } });
        if (!download || download.get().status !== DownloadStatus.PENDING || download.get().action_id !== actionId) return;
        const snapshot = await CVSnapshot.findByPk(download.get().snapshot_id);
        const media = await MediaFiles.findAll({
            where: {
                user_id: userId
            }
        });
        const ownedMedia = media.filter(item => {
            const itemData = item.get();
            return (itemData.owner_type === OwnerType.DOWNLOAD && itemData.owner_id === download.get().id)
                || (itemData.owner_type === OwnerType.CV_SNAPSHOT && itemData.owner_id === download.get().snapshot_id);
        });
        const errorDetails = error instanceof Error ? error : new Error(String(error));

        await ActionLogService.append({
            schemaVersion: 1,
            timestamp: new Date().toISOString(),
            level: trigger === 'ttl_sweeper' ? 'warn' : 'error',
            event: trigger === 'ttl_sweeper' ? 'download.abandoned_timeout' : `download.failed_${trigger}`,
            actionId,
            userId,
            cvId: download.get().origin_id,
            downloadId,
            snapshotId: snapshot?.get().public_id ?? null,
            snapshotHash: download.get().snapshot_hash,
            downloadStatus: DownloadStatus.PENDING,
            trigger,
            failureType,
            message: errorDetails.message.slice(0, 2000),
            stack: errorDetails.stack ?? null,
            pendingExpiresAt: download.get().pending_expires_at?.toISOString() ?? null,
            s3Keys: ownedMedia.map(item => item.get().s3_key),
            cleanup: { dbDeleted: false, deletedS3Keys: [], failedS3Keys: [] }
        });

        await download.destroy();
        if (snapshot) await snapshot.destroy();
    }

    private static async hasDownloadRights(userId: number) {
        if (await SubscriptionService.getUserSubscription(userId)) return true;
        const credits = await DownloadCredits.findOne({ where: { user_id: userId } });
        return (credits?.get().credits ?? 0) > 0;
    }

    private static async findByHash(userId: number, cvId: string, snapshotHash: string, transaction?: Transaction) {
        return Download.findOne({
            where: { user_id: userId, origin_id: cvId, snapshot_hash: snapshotHash },
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined
        });
    }

    private static toPending(download: Download): DownloadPreparation {
        const data = download.get();
        return {
            kind: 'pending',
            actionId: data.action_id,
            downloadId: data.public_id,
            expiresAt: data.pending_expires_at?.getTime() ?? Date.now()
        };
    }

    private static async getWithMedia(downloadId: number) {
        const download = await Download.findByPk(downloadId, {
            include: [{ model: MediaFiles, as: 'mediaFiles' }, {
                model: CVSnapshot,
                as: 'snapshot',
                include: [{ model: MediaFiles, as: 'mediaFiles' }]
            }]
        }) as DownloadWithMediaFiles | null;
        if (!download) throw new Error('Download record not found.');
        return download;
    }

    private static async toPublicDownload(download: DownloadWithMediaFiles): Promise<PublicDownloadData> {
        const { DownloadFile, DownloadPreview } = downloadMappers.extractDownloadMediaFiles(download);
        const snapshot = (download as unknown as { snapshot?: { mediaFiles?: MediaFiles[] } }).snapshot;
        const photo = snapshot?.mediaFiles?.find(media => media.get().type === MediaType.CV_PHOTO);
        if (!DownloadFile || !DownloadPreview || !photo) throw new Error('Completed download media is incomplete.');
        return downloadMappers.mapServerDownloadToPublicDownloadData(
            download.get(),
            await MediaFilesServices.getPublicMediaFileData(DownloadFile),
            await MediaFilesServices.getPublicMediaFileData(DownloadPreview),
            await MediaFilesServices.getPublicMediaFileData(photo)
        );
    }
}