import React from "react";
import { useDownload } from "../../../hooks/useDownload";

type DownloadBtnProps = {
    CVId: string;
}

const DownloadBtn: React.FC<DownloadBtnProps> = ({CVId}) => {

    const { mutate: downloadCV } = useDownload();

    return (
        <button 
            onClick={() => {
                downloadCV(CVId);
            }}
            
        >
            download
        </button>
    )

}

export default DownloadBtn;