import React from "react";
import { DownloadAttributes } from "../../interfaces/downloads";
import { DownloadService } from "../../services/download";
import { useImageWithFallback } from "../../hooks/useImageWithFallback";
import { useDownloadsStore } from "../../Store/useDownloadsStore";
import { useDuplicateDownload } from "../../hooks/useDownload";

type DownloadCardProps = {
    download: DownloadAttributes;
}

const DownloadCard: React.FC<DownloadCardProps> = ({download}) => {

    const deleteDownload = useDownloadsStore(state => state.deleteDownload);

    const { mutate: duplicateDownload } = useDuplicateDownload();
    
    const downloadPreviewSrc = download.downloadPreview.presigned_get_URL;
    const DownloadPreview = useImageWithFallback({
        src: downloadPreviewSrc ? downloadPreviewSrc : null, 
        FallbackComponent: () => <div>No Preview Available</div>,
        alt: "Download Preview",
        className: "h-30 w-auto object-cover"
    })
    
    if(!download.id) return;

    const handleRedownload = () => { DownloadService.redownloadFile(download) };
    const handleDuplicate = () => { 
        duplicateDownload(download.id);
    };

    const handleDelete = () => {
        DownloadService.deleteDownload(download.id);
        deleteDownload(download.id);
    }

    return (
        <>
            <div>{DownloadPreview}</div>
            <button onClick={handleRedownload}> Redownload </button>
            <button onClick={handleDelete}> Delete </button>
            <button onClick={handleDuplicate}> Duplicate </button>
        </>
    )
}

export default DownloadCard;