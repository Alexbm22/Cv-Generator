import React from "react";
import { useDownloadCV } from "../../../hooks/useDownload";
import { Download, LoaderCircle } from 'lucide-react';
import useAuthGuard from "../../../hooks/Auth/useAuthGuard";
import Button from "../../UI/Buttons/Button";
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

    const { mutate: downloadCV, isPending } = useDownloadCV();
    const { requireAuth } = useAuthGuard();

    return (
        <Button
            onClick={() => {
                if (isPending || !requireAuth()) return;
                downloadCV(CVId);
            }}
            disabled={isPending}
            buttonStyle={ButtonStyles.secondary}
            className={className}
            ariaLabel="Download CV"
            title="Download CV"
        >
            <div className="flex items-center gap-1">
                {isPending
                    ? <LoaderCircle size={size} className={`${iconClassName ?? ''} animate-spin`} />
                    : <Download size={size} className={iconClassName} />}
                {showLabel && <span>Download</span>}
            </div>
        </Button>
    )

}

export default DownloadBtn;