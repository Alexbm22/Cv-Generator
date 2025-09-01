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

const CVEditorForm: React.FC = () => {
    return (
        <div className="p-10 bg-white w-full h-full shadow-lg z-0.5">        
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