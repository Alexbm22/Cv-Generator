import React from "react";

type ButtonProps = {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
    onClick, 
    children, 
    className = "",
    variant = 'primary',
    size = 'md',
    disabled = false
}) => {
    const baseClasses = "font-medium w-fit cursor-pointer transition-colors duration-200 rounded-md";
    
    const variantClasses = {
        primary: "text-[#007dff] bg-[#eaf3fe] hover:bg-[#dbe6f4]",
        secondary: "text-[#6b7280] bg-[#f3f4f6] hover:bg-[#e5e7eb]",
        success: "text-[#059669] bg-[#ecfdf5] hover:bg-[#d1fae5]",
        danger: "text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2]"
    };

    const sizeClasses = {
        sm: "text-sm p-1 px-2",
        md: "text-md p-1 px-3",
        lg: "text-lg p-2 px-4"
    };

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:bg-current" : "";

    return (
        <button 
            onClick={disabled ? undefined : onClick} 
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button;