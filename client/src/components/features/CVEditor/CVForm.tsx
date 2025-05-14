import React from "react";
import {
    PersonalInfos,
    ProfessionalSummary,
    WorkExperience,
    Education,
    Skill
} from "./sections";

const CVEditorForm: React.FC = () => {
    return (
        <div className="p-7">        
            <PersonalInfos/>
            <ProfessionalSummary/>
            <WorkExperience/>
            <Education/>
            <Skill/>
        </div>  
    );
}

export default CVEditorForm;