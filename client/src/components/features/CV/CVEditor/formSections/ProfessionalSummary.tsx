import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { useCvEditStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import React from 'react';

const { professional_summary: summaryConstants } = CV_EDITOR_FORM_CONSTANTS.sections;

const ProfessionalSummary: React.FC= () => {

  const setProfessionalSummary = useCvEditStore((state) => state.setProfessionalSummary);
  const professionalSummary = useCvEditStore((state) => state.professionalSummary);

  return (
    <div className="mt-5">
      <h2 className="text-xl text-[#154D71] font-bold">{summaryConstants.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{summaryConstants.description}</p>
      <Editor 
        onHtmlChange={(html) => setProfessionalSummary(html)}
        htmlContent={professionalSummary}
        placeholder={summaryConstants.placeholder}
      />
    </div>
  );
}

export default ProfessionalSummary;