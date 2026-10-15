import { MimeType } from '@/interfaces/mediaFiles';

export const PDF_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const getUploadMaxBytes = (mimeType: MimeType) =>
    mimeType === MimeType.APPLICATION_PDF ? PDF_UPLOAD_MAX_BYTES : IMAGE_UPLOAD_MAX_BYTES;
