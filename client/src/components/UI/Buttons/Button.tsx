import React from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
    onClick: () => void;
    children: React.ReactNode;
    buttonStyle?: string;
    className?: string;
    ariaLabel?: string;
    title?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({ 
    onClick, 
    children, 
    buttonStyle = "",
    className = "",
    disabled = false,
    ariaLabel,
    title,
    type
}) => {
    
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:bg-current" : "";

    return (
        <button 
            onClick={disabled ? undefined : onClick} 
            disabled={disabled}
            aria-label={ariaLabel}
            title={title}
            type={type}
            className={twMerge(buttonStyle, className, disabledClasses)}
        >
            {children}
        </button>
    )
}

export default Button;