import React from 'react';
import { NavItem, NavPosition } from './types';
import Logo, { LogoProps } from './Logo';

export interface BaseNavProps {
  // Layout and positioning
  position?: NavPosition;
  
  // Styling
  className?: string;
  height?: string;
  backgroundColor?: string;
  blur?: boolean;
  border?: boolean;
  shadow?: boolean;
  responsiveStyle?: string;
  itemsContainerStyle?: string;

  // Logo configuration
  isShowingLogo?: boolean;
  logoPosition?: 'left' | 'center' | 'right';
  logoProps?: LogoProps;
  
  // Content
  leftItems?: NavItem[];
  centerItems?: NavItem[];
  rightItems?: NavItem[];

  // Behavior
  zIndex?: number;
}

const BaseNav: React.FC<BaseNavProps> = ({
  position = 'sticky',
  className = '',
  height = 'h-15',
  backgroundColor = 'bg-[#ffffff]',
  blur = true,
  border = false,
  shadow = false,
  leftItems = [],
  centerItems = [],
  rightItems = [],
  itemsContainerStyle = '',
  responsiveStyle = '',
  zIndex = 50,
  isShowingLogo = false,
  logoPosition = 'left',
  logoProps = {},
}) => {
  
  // Build base classes
  const zIndexClass = {
    10: 'z-10',
    20: 'z-20',
    30: 'z-30',
    40: 'z-40',
    50: 'z-50',
    auto: 'z-auto',
  }[zIndex] || 'z-50';

  const baseClasses = [
    'flex',
    'items-center',
    'justify-between',
    height,
    position,
    backgroundColor,
    zIndexClass,
    responsiveStyle
  ];


  // Add optional effects
  if (blur) baseClasses.push('backdrop-blur-md');
  if (border) baseClasses.push('border-b border-gray-200');
  if (shadow) baseClasses.push('shadow-sm');

  // Render nav items
  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      if (item.component) {
        return <div key={item.id} className="h-full">{item.component}</div>;
      }

      const itemClasses = [
        item.className || '',
        item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-[#90c5fa]',
        item.isActive ? 'text-[#90c5fa]' : '',
        'flex h-full flex-col items-center gap-2 transition-colors duration-200',
      ].join(' ');

      if (item.href) {
        return (
          <a
            key={item.id}
            href={item.href}
            className={itemClasses}
            onClick={item.disabled ? undefined : item.onClick}
          >
            {item.icon}
          </a>
        );
      }

      return (
        <button
          key={item.id}
          className={itemClasses}
          onClick={item.disabled ? undefined : item.onClick}
          disabled={item.disabled}
        >
          {item.icon}
        </button>
      );
    });
  };

  // Render logo component
  const renderLogo = () => {
    if (!isShowingLogo) return null;
    return <Logo {...logoProps} />;
  };

  return (
    <nav className={`${baseClasses.join(' ')} ${className}`}>
      {/* Left section */}
      <div className={`flex items-center gap-2 sm:gap-4 h-full ${itemsContainerStyle}`}>
        {logoPosition === 'left' && isShowingLogo ? renderLogo() : renderNavItems(leftItems)}
      </div>

      {/* Center section */}
      <div className={`flex items-center gap-2 sm:gap-4 h-full ${itemsContainerStyle}`}>
        {logoPosition === 'center' && isShowingLogo ? renderLogo() : renderNavItems(centerItems)}
      </div>

      {/* Right section */}
      <div className={`flex items-center gap-2 sm:gap-4 h-full ${itemsContainerStyle}`}>
        {logoPosition === 'right' && isShowingLogo ? renderLogo() : renderNavItems(rightItems)}
      </div>
    </nav>
  );
};

export default BaseNav;