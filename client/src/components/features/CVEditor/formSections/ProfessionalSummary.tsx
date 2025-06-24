import { useCvEditStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import React from 'react';
import { CVEditContent } from '../../../../config/content';

const ProfessionalSummary: React.FC= () => {

  const setProfessionalSummary = useCvEditStore((state) => state.setProfessionalSummary);
  const professionalSummary = useCvEditStore((state) => state.professionalSummary);

  const { professionalSummary: summaryContent } = CVEditContent.formSections;

  return (
    <div className="mt-5">
      <h2 className="text-xl text-gray-600 font-bold">{summaryContent.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{summaryContent.description}</p>
      <Editor 
        onHtmlChange={(html) => setProfessionalSummary(html)}
        htmlContent={professionalSummary}
        placeholder={summaryContent.summaryPlaceholder}
      />
    </div>
  );
}

export default ProfessionalSummary;