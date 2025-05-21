import React from "react";
import { useCvStore } from "../../../../../Store";

interface CVPhotoProps {
  fallbackUrl?: string;
  className?: string;
}

const CVPhoto: React.FC<CVPhotoProps> = ({
  fallbackUrl = "/Images/anonymous_Picture.png",
  className
}) => {
  const { photo } = useCvStore();
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