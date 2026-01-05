import React from "react";
import { useNavigate } from "react-router-dom";
import { UserRound } from 'lucide-react';
import { routes } from "../../../router/routes";
import Button from "../../UI/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";
import { useAuthStore } from "../../../Store";
import { useLogout } from "../../../hooks/Auth/useAuth";
import { Dropdown } from "../../UI";

type ProfileBtnProps = {
    className?: string;
    iconClassName?: string;
    size?: number;
    showLabel?: boolean;
}

const ProfileBtn: React.FC<ProfileBtnProps> = ({
    className, 
    iconClassName, 
    size,
    showLabel = false
}) => {

    const navigate = useNavigate();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const { mutate: logout } = useLogout();
    
    return (
        <Dropdown
            width="w-30"
            trigger={
                <Button 
                    className={className}
                    buttonStyle={ButtonStyles.secondary}
                    onClick={() => {}}
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
            }
        >
            {
                isAuthenticated ? (
                    <div>
                        <Button
                            buttonStyle={ButtonStyles.dropdown}
                            onClick={() => {
                                navigate(routes.profile.path);
                            }}
                        >
                            View Profile
                        </Button>
                        <Button
                            buttonStyle={ButtonStyles.dropdown}
                            onClick={() => {
                                logout();
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                    
                ) : (
                    <div>
                        <Button
                            buttonStyle={ButtonStyles.dropdown}
                            onClick={() => {
                                navigate(routes.login.path);
                            }}
                        >
                            Login
                        </Button>
                    </div>
                )
            }
        </Dropdown>
    );
};

export default ProfileBtn;