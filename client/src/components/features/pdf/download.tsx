import React from "react";
import { CVAttributes } from "../../../interfaces/cv";
import { useDownload } from "../../../hooks/useDownload";
import { DownloadService } from "../../../services/download";
import { TemplateMap } from "../../../constants/CV/TemplatesMap";

type DownloadBtnProps = {
    downloadedCV: CVAttributes
}

const DownloadBtn: React.FC<DownloadBtnProps> = ({downloadedCV}) => {

    const { mutate: downloadCV, isPending } = useDownload(downloadedCV);

    return (
        <button 
            onClick={async () => {
                downloadCV(downloadCV);
            }}
            
        >
            download
        </button>
    )

}

export default DownloadBtn;