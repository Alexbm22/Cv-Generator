import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import Button from "./Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";

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
        <Button
            onClick={handleBackClick}
            className={className}
            buttonStyle={ButtonStyles.secondary}
            ariaLabel="Go Back"
            title="Go Back"
        >
            <div className="flex items-center gap-1">
                <ArrowLeft 
                    size={size} 
                    className={iconClassName} 
                />
                {showLabel && <span>Back</span>}
            </div>
        </Button>
    );
};

export default BackBtn;