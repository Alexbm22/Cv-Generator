import PdfIcon from '../PdfIconGenerator';
import { View } from '@react-pdf/renderer';

const Path = "M96 32l0 32L48 64C21.5 64 0 85.5 0 112l0 48 448 0 0-48c0-26.5-21.5-48-48-48l-48 0 0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32L160 64l0-32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192L0 192 0 464c0 26.5 21.5 48 48 48l352 0c26.5 0 48-21.5 48-48l0-272z";

interface IconProps {
  size: number;
  color: string;
  style: any;
}

const Date = ({size, color, style}: IconProps) => (
  <View>
    <PdfIcon iconPath={Path} size={size} color={color} style={style}/>
  </View>
);

export default Date;