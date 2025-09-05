import React from "react";
import { UserCVAttributes } from "../../../interfaces/cv";
import { useDownload } from "../../../hooks/useDownload";

type DownloadBtnProps = {
    downloadedCV: UserCVAttributes
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