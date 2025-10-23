import React from "react";
import { useDownloadCV } from "../../../hooks/useDownload";
import { Download } from 'lucide-react';
import useAuthGuard from "../../../hooks/Auth/useAuthGuard";

type DownloadBtnProps = {
    CVId: string;
    className?: string;
    iconClassName?: string;
    size?: number;
}

const DownloadBtn: React.FC<DownloadBtnProps> = ({CVId, className, iconClassName, size}) => {

    const { mutate: downloadCV } = useDownloadCV();
    const { requireAuth } = useAuthGuard();

    return (
        <button 
            className={className}
            onClick={() => {
                if (!requireAuth()) return;
                downloadCV(CVId);
            }}
        >
            <Download size={size} className={iconClassName} />
        </button>
    )

}

export default DownloadBtn;