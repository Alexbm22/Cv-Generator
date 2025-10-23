import { DownloadAttributes, DownloadWithMediaFiles, PublicDownloadData } from "@/interfaces/downloads"
import { MediaType, PublicMediaFilesAttributes } from "@/interfaces/mediaFiles"

const mapServerDownloadToPublicDownloadData = (
    download: DownloadAttributes, 
    file: PublicMediaFilesAttributes,
    preview: PublicMediaFilesAttributes,
    photo: PublicMediaFilesAttributes
): PublicDownloadData => {
    return {
        id: download.public_id,
        fileName: download.fileName,
        createdAt: download.createdAt,
        downloadFile: file,
        downloadPreview: preview,
        downloadPhoto: photo
    }
}

const extractDownloadMediaFiles = (download: DownloadWithMediaFiles) => {
    const file = download.mediaFiles.find(mediaFile => mediaFile.get().type === MediaType.DOWNLOAD_FILE)!;
    const preview = download.mediaFiles.find(mediaFile => mediaFile.get().type === MediaType.DOWNLOAD_FILE_PREVIEW)!;
    const photo = download.mediaFiles.find(mediaFile => mediaFile.get().type === MediaType.DOWNLOAD_FILE_PHOTO)!;

    return {
        DownloadData: download,
        DownloadFile: file,
        DownloadPreview: preview,
        DownloadPhoto: photo
    };
}

export default {
    mapServerDownloadToPublicDownloadData,
    extractDownloadMediaFiles
}