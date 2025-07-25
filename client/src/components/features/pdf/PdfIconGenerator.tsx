import { Svg, Path } from '@react-pdf/renderer';
import React from 'react';

interface IconProps {
  iconPath: string;
  color: string;
  size: number;
  style: any;
}

const PdfIcon: React.FC<IconProps> = ({
  iconPath,
  size,
  color,
  style,
}) => (
  <Svg
    viewBox="0 0 512 512"
    style={[{ width: size, height: size }, style]}
  >
    <Path d={iconPath} fill={color} />
  </Svg>
);

export default PdfIcon;