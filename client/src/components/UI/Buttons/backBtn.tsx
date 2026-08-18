import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { twMerge } from "tailwind-merge";

type BackBtnProps = {
    className?: string;
    iconClassName?: string;
    size?: number;
    showLabel?: boolean;
    onClick?: () => void;
    to?: string;
}

const BackBtn: React.FC<BackBtnProps> = ({
    className, 
    iconClassName, 
    size,
    showLabel = false,
    onClick,
    to
}) => {

    const navigate = useNavigate();

    const handleBackClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    return (
        <button
            type="button"
            onClick={handleBackClick}
            aria-label="Go Back"
            title="Go Back"
            className={twMerge(
                "h-11 w-auto px-3 rounded-xl border border-black/[0.06] bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.10)] cursor-pointer hover:bg-black/[0.05] flex items-center justify-center transition-all duration-350 active:scale-95",
                className
            )}
        >
            <div className="flex items-center gap-1">
                <ArrowLeft 
                    size={size} 
                    className={iconClassName} 
                />
                {showLabel && <span>Back</span>}
            </div>
        </button>
    );
};

export default BackBtn;