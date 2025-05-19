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
} from "./sections";

const CVEditorForm: React.FC = () => {
    return (
        <div className="p-7">        
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