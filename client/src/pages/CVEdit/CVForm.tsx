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
} from "../../components/features/CV/CVEditor/formSections";

type ComponentProps = {
  isShowingPreview: boolean;
  padding?: string 
}

const CVEditorForm: React.FC<ComponentProps> = ({ isShowingPreview }) => {
    return (
        <div 
            className="transition-all duration-1000 bg-[#f3fbff] w-full shadow-lg z-0.5 overflow-y-auto"
            style={isShowingPreview ? {flexBasis: '56.25%'} : {flexBasis: '100%'} }
         >
            <div className="p-cv-editor-padding">        
                <PersonalInfos/>
                <ProfessionalSummary/>
                <WorkExperience/>
                <Education/>
                <Skill/>
                <Language/>
                <Projects/>
                <CustomSection/>
            </div>
        </div>  
    );
}

export default CVEditorForm;