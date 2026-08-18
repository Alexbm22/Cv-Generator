import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { 
    User, 
    Settings, 
    Download, 
    CreditCard, 
    LogOut, 
    ChevronDown 
} from "lucide-react";
import { useAuthStore } from "../../../Store";
import { useLogout } from "../../../hooks/Auth/useAuth";
import { routes } from "../../../router/routes";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";
import useProfilePictureUrl from "../../../hooks/useProfilePictureUrl";

interface ProfileDropdownProps {
    className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const username = useAuthStore(state => state.username);
    const email = useAuthStore(state => state.email);
    const { mutate: logout } = useLogout();

    const { profilePictureUrl } = useProfilePictureUrl();
    
    const handleButtonClick = () => { setIsOpen(!isOpen) };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    // Dropdown menu item component
    const Dropdown: React.FC<{ 
        children: React.ReactNode; 
        onClick?: () => void;
        className?: string;
    }> = ({ children, onClick, className = "" }) => (
        <div className="p-0.5 w-full">
            <button
                onClick={onClick}
                className={twMerge(ButtonStyles.navigationMenu, className)}
            >
                {children}
            </button>
        </div>
    );

    const Separator = ({ className = "" }: { className?: string }) => (
        <div className={twMerge("border-t border-gray-200 my-1 w-full", className)} />
    );

    return (
        <div 
            ref={dropdownRef} 
            className={twMerge("min-w-0 items-center mt-auto", className)}
        >
            {isAuthenticated ? (
                <div className={twMerge("border w-full flex flex-col items-center border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] cursor-pointer justify-center active:scale-95 transition-all duration-300 rounded-xl", isOpen ? 'shadow-lg' : '')}>
                    {/* Button as part of the dropdown */}
                    <button
                        onClick={handleButtonClick}
                        className="w-full h-11 flex items-center cursor-pointer gap-2.5 px-2.5 sm:justify-evenly transition-colors duration-200"
                        aria-label="Profile menu"
                        aria-expanded={isOpen}
                    >
                        <div className="w-8 h-8 rounded-full to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <div
                                className={`w-8 h-8 rounded-full border border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0`}
                            >
                                <img
                                    src={profilePictureUrl}
                                    alt={username || "Profile Picture"}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                        </div>

                        <div className="hidden sm:flex gap-0 flex-col items-start min-w-0 w-full">
                            <span className="text-sm leading-tight font-semibold text-gray-900 truncate max-w-[120px]">
                                {username || "User"}
                            </span>
                            <span className="text-xs leading-tight text-gray-500 truncate max-w-[120px]">
                                {email || "user@example.com"}
                            </span>
                        </div>

                        <ChevronDown 
                            className={twMerge("w-4 h-4 text-gray-600 transition-transform duration-200 flex-shrink-0", isOpen && 'rotate-180')}
                        />
                    </button>

                    
                    {/* Dropdown Content - part of the same element */}
                    <div
                        className={twMerge("overflow-hidden flex flex-col w-full items-center transition-normal duration-500", isOpen ? 'max-h-screen opacity-100 p-1.25' : 'max-h-0 opacity-0 pointer-events-none')}
                    >
                        <Separator className="my-0" />

                        {/* Menu Links */}
                        <div className="w-full mx-auto">
                            <Dropdown
                                onClick={() => handleNavigation(`${routes.settings.path}?section=account`)}
                            >
                                <span className="text-gray-600"><User className="w-4 h-4" /></span>
                                <span>User Profile</span>
                            </Dropdown>
                            <Dropdown
                                onClick={() => handleNavigation(`${routes.settings.path}?section=downloads`)}
                            >
                                <span className="text-gray-600"><Download className="w-4 h-4" /></span>
                                <span>Downloads</span>
                            </Dropdown>
                            <Dropdown
                                onClick={() => handleNavigation(`${routes.settings.path}?section=subscription`)}
                            >
                                <span className="text-gray-600"><CreditCard className="w-4 h-4" /></span>
                                <span>Subscription</span>
                            </Dropdown>
                        </div>

                        <Separator />

                        <Dropdown
                            onClick={() => handleNavigation(routes.settings.path)}
                        >
                            <span className="text-gray-600"><Settings className="w-4 h-4" /></span>
                            <span>Settings</span>
                        </Dropdown>

                        <Separator />



                            {/* Logout Button */}
                            <Dropdown
                                onClick={handleLogout}
                                className="text-red-600 bg-red-50 hover:bg-[#ffdbdb] transition-colors duration-300"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </Dropdown>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => handleNavigation(routes.login.path)}
                    className="w-full h-11 max-w-none p-3 px-6 cursor-pointer justify-center text-[17px] items-center flex rounded-xl bg-[#0071e3] text-white font-semibold shadow-[0_1px_3px_rgba(0,113,227,0.35)] hover:bg-[#0060c7] active:scale-95 transition-all duration-300"
                >
                    Login
                </button>
            )}
        </div>
    );
};

export default ProfileDropdown;
