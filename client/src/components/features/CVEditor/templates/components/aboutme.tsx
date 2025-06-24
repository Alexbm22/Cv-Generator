import React from "react";
import { useCvEditStore } from "../../../../../Store";
import { CVPreviewContent } from "../../../../../config/content";

interface AboutMeProps {
  titleClassName: string;
  componentClassName: string;
  contentClassName: string;
}

const AboutMe: React.FC<AboutMeProps> = ({
  componentClassName,
  titleClassName,
  contentClassName
}) => { 

  const { aboutme } = CVPreviewContent.sections;

  const professionalSummary = useCvEditStore((state) => state.professionalSummary);
  const content = professionalSummary === '<p><br></p>' ? aboutme.defaultContent : professionalSummary; // Check if the content is empty and set it to defaultContent

  return (
    <>
      <div className={componentClassName}>
        <h1 className={titleClassName}>{aboutme.title}</h1>
        <div 
          className={contentClassName} 
          dangerouslySetInnerHTML={{ 
            __html: content !== '<p><br></p>' ? content : aboutme.defaultContent 
          }} 
        />
      </div>
    </>
  );
};

export default AboutMe;