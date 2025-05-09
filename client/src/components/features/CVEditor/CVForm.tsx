import React from "react";
import {
    PersonalInfos,
    ProfessionalSummary,
    WorkExperience,
} from "./sections";

const CVEditorForm: React.FC = () => {
    return (
        <div className="p-7">        
            <PersonalInfos/>
            <ProfessionalSummary/>
            <WorkExperience/>
        </div>  
    );
}

export default CVEditorForm;