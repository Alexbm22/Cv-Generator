import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { 
    User, 
    Settings, 
    Download, 
    CreditCard, 
    LogOut, 
    Moon, 
    Sun,
    Crown,
    ChevronDown 
} from "lucide-react";
import { useAuthStore } from "../../../Store";
import { useLogout } from "../../../hooks/Auth/useAuth";
import { routes } from "../../../router/routes";
import Button from "../../UI/Buttons/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";

interface ProfileDropdownProps {
    className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // to be implemented
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const username = useAuthStore(state => state.username);
    const email = useAuthStore(state => state.email);
    const profilePicture = useAuthStore(state => state.profilePicture);
    const { mutate: logout } = useLogout();

    // Extract profile picture URL
    const getProfilePictureUrl = (): string | null => {
        if (typeof profilePicture === 'string') {
          return profilePicture;  
        } else {
            return profilePicture?.presigned_get_URL ?? null;
        }
    };

    const profilePictureUrl = getProfilePictureUrl();

    // Handle click on trigger button: toggle dropdown
    const handleButtonClick = () => { setIsOpen(!isOpen) };

    // Click outside to close dropdown
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
                className={twMerge("flex items-center cursor-pointer gap-3 rounded-lg w-full px-2.5 py-1.75 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150", className)}
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
            className={twMerge("flex-1 min-w-0 items-center", className)}
        >
            {isAuthenticated ? (
                <div className={twMerge("border w-full flex flex-col items-center border-[#cacaca] bg-white transition-all duration-200 rounded-lg", isOpen ? 'shadow-lg' : 'shadow-sm')}>
                    {/* Button as part of the dropdown */}
                    <button
                        onClick={handleButtonClick}
                        className="w-full flex items-center cursor-pointer gap-2.5 px-2.5 py-1 justify-evenly transition-colors duration-200"
                        aria-label="Profile menu"
                        aria-expanded={isOpen}
                    >
                        <div className="w-8 h-8 rounded-full to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {profilePictureUrl ? (
                                <img 
                                    src={profilePictureUrl} 
                                    alt={username || "/Images/anonymous_Picture.png"} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-4 h-4 text-white" />
                            )}
                        </div>

                        <div className="hidden sm:flex flex-col items-start min-w-0 w-full">
                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                                {username || "User"}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
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
                                onClick={() => handleNavigation(routes.profile.path)}
                            >
                                <span className="text-gray-600"><User className="w-4 h-4" /></span>
                                <span>User Profile</span>
                            </Dropdown>
                            <Dropdown
                                onClick={() => handleNavigation(routes.downloads.path)}
                            >
                                <span className="text-gray-600"><Download className="w-4 h-4" /></span>
                                <span>Downloads</span>
                            </Dropdown>
                            <Dropdown
                                onClick={() => handleNavigation(routes.prices.path)}
                            >
                                <span className="text-gray-600"><CreditCard className="w-4 h-4" /></span>
                                <span>Subscription</span>
                            </Dropdown>
                        </div>

                        <Separator />

                        <Dropdown
                            onClick={() => handleNavigation(routes.profile.path)}
                        >
                            <span className="text-gray-600"><Settings className="w-4 h-4" /></span>
                            <span>Settings</span>
                        </Dropdown>

                        <Separator />

                        {/* Action Buttons */}
                        <Dropdown
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="justify-between"
                        >
                            
                            <div className="flex items-center gap-3">
                                <div className="text-gray-600 relative w-4 h-4 flex items-center justify-center">
                                    <Moon className={twMerge("w-4 h-4 absolute transition-all duration-700", isDarkMode ? 'opacity-0' : 'opacity-100')} />
                                    <Sun className={twMerge("w-4 h-4 absolute transition-all duration-700", isDarkMode ? 'opacity-100' : 'opacity-0')} />
                                </div>
                                <span className="transition-all duration-300">{isDarkMode ? "Dark" : "Light"} Mode</span>
                            </div>
                            <div className={twMerge("w-10 h-5 rounded-full transition-colors duration-200 relative", isDarkMode ? 'bg-blue-500' : 'bg-gray-300')}>
                                <div className={twMerge("absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200", isDarkMode && 'transform translate-x-5')} />
                            </div>
                        </Dropdown>

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
                <div className="flex items-center gap-2">
                    <div className="p-3 space-y-2">
                        <Button
                            onClick={() => handleNavigation(routes.login.path)}
                            buttonStyle={ButtonStyles.primary}
                            className="w-full justify-center"
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => handleNavigation(routes.signup.path)}
                            buttonStyle={ButtonStyles.secondary}
                            className="w-full justify-center"
                        >
                            Sign Up
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
