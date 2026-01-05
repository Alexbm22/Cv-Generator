import React from "react";
import {
    PersonalInfos,
    ProfessionalSummary,
    WorkExperience,
    Education,
    Skill,
    Language,
    Projects,
    CustomSection
} from "./formSections";

type ComponentProps = {
  isShowingPreview: boolean;
  padding?: string 
}

const CVEditorForm: React.FC<ComponentProps> = ({ isShowingPreview }) => {
    return (
        <div 
            className={`transition-all duration-1000 p-cv-editor-padding bg-[#f3fbff] w-full h-full shadow-lg z-0.5`}
            style={isShowingPreview ? {flexBasis: '56.25%'} : {flexBasis: '100%'} }
         >        
            <PersonalInfos/>
            <ProfessionalSummary/>
            <WorkExperience/>
            <Education/>
            <Skill/>
            <Language/>
            <Projects/>
            <CustomSection/>
        </div>  
    );
}

export default CVEditorForm;