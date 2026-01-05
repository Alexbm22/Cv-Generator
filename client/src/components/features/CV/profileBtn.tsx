import React from "react";
import { useNavigate } from "react-router-dom";
import { UserRound } from 'lucide-react';
import { routes } from "../../../router/routes";
import Button from "../../UI/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";

type ProfileBtnProps = {
    className?: string;
    iconClassName?: string;
    size?: number;
    showLabel?: boolean;
    onClick?: () => void;
}

const ProfileBtn: React.FC<ProfileBtnProps> = ({
    className, 
    iconClassName, 
    size,
    showLabel = false,
    onClick
}) => {

    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(routes.profile.path);
        }
    };

    return (
        <Button 
            className={className}
            buttonStyle={ButtonStyles.secondary}
            onClick={handleProfileClick}
            ariaLabel="Go to Profile"
            title="Go to Profile"
        >
            <div className="flex items-center gap-1">
                <UserRound 
                    size={size} 
                    className={iconClassName} 
                />
                {showLabel && <span>Profile</span>}
            </div>
        </Button>
    );
};

export default ProfileBtn;