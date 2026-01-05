import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label?: string;
  icon?: ReactNode;
  component?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
}

// Navigation section types
export enum NavSections {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

// Navigation position types
export type NavPosition = 'sticky' | 'fixed' | 'relative' | 'absolute';
