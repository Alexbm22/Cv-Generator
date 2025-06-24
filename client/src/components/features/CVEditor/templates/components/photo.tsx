import React from "react";
import { useCvEditStore } from "../../../../../Store";

interface CVPhotoProps {
  fallbackUrl?: string;
  className?: string;
}

const CVPhoto: React.FC<CVPhotoProps> = ({
  fallbackUrl = "/Images/anonymous_Picture.png",
  className
}) => {
  const photo = useCvEditStore((state) => state.photo);
  const currentPhoto =  photo ?? fallbackUrl;

  return (
    <img 
      src={currentPhoto} 
      alt="cv photo" 
      className={className}
    />
  );
};

export default CVPhoto;