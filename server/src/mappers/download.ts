import { DownloadAttributes, DownloadWithMediaFiles, PublicDownloadData } from "@/interfaces/downloads"
import { MediaTypes, PublicMediaFilesAttributes } from "@/interfaces/mediaFiles"

const mapServerDownloadToPublicDownloadData = (
    download: DownloadAttributes, 
    file: PublicMediaFilesAttributes,
    preview: PublicMediaFilesAttributes
): PublicDownloadData => {
    return {
        id: download.public_id,
        fileName: download.fileName,
        createdAt: download.createdAt,
        downloadFile: file,
        downloadPreview: preview,
    }
}

const extractDownloadMediaFiles = (download: DownloadWithMediaFiles) => {
    const file = download.mediaFiles.find(mediaFile => mediaFile.get().type === MediaTypes.DOWNLOAD_FILE)!;
    const preview = download.mediaFiles.find(mediaFile => mediaFile.get().type === MediaTypes.DOWNLOAD_FILE_PREVIEW)!;

    return {
        DownloadData: download,
        DownloadFile: file,
        DownloadPreview: preview
    };
}

export default {
    mapServerDownloadToPublicDownloadData,
    extractDownloadMediaFiles
}