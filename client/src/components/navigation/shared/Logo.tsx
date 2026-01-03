import React from 'react';

export enum LOGO_SIZES {
  xs = 'h-12 w-12',
  sm = 'h-8 w-8',
  md = 'h-10 w-10',
  lg = 'h-12 w-12',
  xl = 'h-16 w-16',
};

export interface LogoProps {
  // Content
  src?: string;
  alt?: string;
  
  // Styling
  size?: LOGO_SIZES;
  className?: string;
  imageClassName?: string;
  
  // Behavior
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  src,
  alt = 'Logo',
  size = LOGO_SIZES.md,
  className = '',
  imageClassName = '',
  onClick,
}) => {
  
  const logoContent = () => {
    return src ? (
      <img
        src={src}
        alt={alt}
        className={`${size} object-contain ${imageClassName}`}
      />
    ) : (
      <div className={`${size} bg-gray-200 rounded flex items-center justify-center ${imageClassName}`}>
        <span className="text-gray-500 text-xs">Logo</span>
      </div>
    );
  };

  const baseClasses = `flex items-center ${className}`;

  if (onClick) {
    return (
      <button
        className={`${baseClasses} hover:opacity-80 transition-opacity cursor-pointer`}
        onClick={onClick}
      >
        {logoContent()}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {logoContent()}
    </div>
  );
};

export default Logo;