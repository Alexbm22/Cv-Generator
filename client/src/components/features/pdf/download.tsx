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
                // temporary for development purposes
                const TemplateComponent = TemplateMap[downloadedCV.template]
                await DownloadService.downloadPdf(TemplateComponent, downloadedCV)
            }}
            
        >
            download
        </button>
    )

}

export default DownloadBtn;