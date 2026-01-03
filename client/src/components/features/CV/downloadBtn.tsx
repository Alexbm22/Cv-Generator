import React from "react";
import { useDownloadCV } from "../../../hooks/useDownload";
import { Download } from 'lucide-react';
import useAuthGuard from "../../../hooks/Auth/useAuthGuard";
import Button from "../../UI/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";

type DownloadBtnProps = {
    CVId: string;
    className?: string;
    iconClassName?: string;
    size?: number;
    showLabel?: boolean;
}

const DownloadBtn: React.FC<DownloadBtnProps> = ({
    CVId, 
    className = "", 
    iconClassName, 
    size,
    showLabel = false
}) => {

    const { mutate: downloadCV } = useDownloadCV();
    const { requireAuth } = useAuthGuard();

    return (
        <Button
            onClick={() => {
                if (!requireAuth()) return;
                downloadCV(CVId);
            }}
            buttonStyle={ButtonStyles.secondary}
            className={className}
            ariaLabel="Download CV"
            title="Download CV"
        >
            <div className="flex items-center gap-1">
                <Download size={size} className={iconClassName} />
                {showLabel && <span>Download</span>}
            </div>
        </Button>
    )

}

export default DownloadBtn;