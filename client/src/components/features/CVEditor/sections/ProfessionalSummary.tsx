import { useCvStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import React from 'react';

const ProfessionalSummary: React.FC= () => {

  const { setProfessionalSummary, professionalSummary } = useCvStore();

  return (
    <div className="mt-5">
      <h2 className="text-xl text-gray-600 font-bold">Professional Summary</h2>
      <p className="text-sm text-gray-500 mb-4">Add your social media links (e.g. LinkedIn, GitHub, etc.)</p>
      <Editor 
        onHtmlChange={(html) => setProfessionalSummary(html)}
        htmlContent={professionalSummary}
        placeholder="Write a brief summary about yourself, your skills, and your career goals. This is your chance to make a strong first impression on potential employers."
      />
    </div>
  );
}

export default ProfessionalSummary;