import { useContext } from 'react';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { useCvEditStore, useAuthStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import { CollapsableAiContext } from '../../../../UI/CollapsableAiContext';
import AiPanel from '../../../../UI/TextEditor/AiAssistant/AiPanel';
import { sanitizeHtml } from '../../../../../utils';

const { about_me: aboutMeConstants } = CV_EDITOR_FORM_CONSTANTS.sections;

const AboutMe: React.FC = () => {

  const setAboutMe = useCvEditStore((state) => state.setAboutMe);
  const aboutMe = useCvEditStore((state) => state.aboutMe);
  const cvId = useCvEditStore((state) => state.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const collapsableCtx = useContext(CollapsableAiContext);
  const aiOpen = collapsableCtx ? collapsableCtx.aiOpen : false;

  return (
    <div className="mt-3">
      <Editor 
        onHtmlChange={(html) => setAboutMe(html)}
        htmlContent={aboutMe}
        placeholder={aboutMeConstants.placeholder}
      />
      <AiPanel
        isOpen={aiOpen}
        sectionType="aboutMe"
        currentText={aboutMe}
        onApplyTextChange={(text) => setAboutMe(sanitizeHtml(text))}
        cvId={isAuthenticated && cvId ? cvId : undefined}
      />
    </div>
  );
}

export default AboutMe;
