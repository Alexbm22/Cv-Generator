import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { useCvEditStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import React, { useEffect } from 'react';

const { professional_summary: summaryConstants } = CV_EDITOR_FORM_CONSTANTS.sections;

const ProfessionalSummary: React.FC= () => {

  const setProfessionalSummary = useCvEditStore((state) => state.setProfessionalSummary);
  const professionalSummary = useCvEditStore((state) => state.professionalSummary);

  useEffect(() => {
    console.log('ProfessionalSummary updated:', professionalSummary);
  }, [professionalSummary])
  return (
    <div className="mt-3">
      <Editor 
        onHtmlChange={(html) => setProfessionalSummary(html)}
        htmlContent={professionalSummary}
        placeholder={summaryConstants.placeholder}
      />
    </div>
  );
}

export default ProfessionalSummary;