import React, { useContext } from 'react';
import { useCvEditStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import Collapsable, { CollapsableAiContext } from '../../../../UI/Collapsable';
import InputField from '../../../../UI/InputField';
import { sanitizeHtml } from '../../../../../utils';
import { Education } from '../../../../../interfaces/cv';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { AiPanel } from '../../../../UI/TextEditor/AiAssistant';

interface ComponentProps {
    education: Education
}

const { education: educationConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = educationConstants;

const EducationComponent:React.FC<ComponentProps> = ({ education }) => {

    const updateEducation = useCvEditStore((state) => state.updateEducation);

    const collapsableCtx = useContext(CollapsableAiContext);
    const aiOpen = collapsableCtx ? collapsableCtx.aiOpen : true;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <InputField
                    id={`degree-${education.id}`}
                    label={fieldsConstants.degree.label}
                    placeholder={fieldsConstants.degree.placeholder}
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, { degree: e.target.value })}
                />

                <InputField
                    id={`institution-${education.id}`}
                    label={fieldsConstants.institution.label}
                    placeholder={fieldsConstants.institution.placeholder}
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, { institution: e.target.value })}
                />

                <InputField
                    type={fieldsConstants.start_date.type}
                    id={`startDate-${education.id}`}
                    label={fieldsConstants.start_date.label}
                    placeholder={fieldsConstants.start_date.placeholder}
                    value={new Date(education.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { startDate: new Date(e.target.value) })}
                />

                <InputField
                    type={fieldsConstants.end_date.type}
                    id={`endDate-${education.id}`}
                    placeholder={fieldsConstants.end_date.placeholder}
                    label={fieldsConstants.end_date.label}
                    value={new Date(education.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor
                htmlContent={education.description}
                onHtmlChange={(html) => updateEducation(education.id, { description: sanitizeHtml(html) })}
                placeholder={fieldsConstants.section_description}
                sectionType='education'
            />

            <AiPanel
                isOpen={aiOpen}
                sectionType="education"
                contentId={education.id}
                currentItem={{
                    degree: education.degree,
                    institution: education.institution,
                    startDate: new Date(education.startDate).toISOString().slice(0, 10),
                    endDate: new Date(education.endDate).toISOString().slice(0, 10),
                    description: education.description,
                }}
                onApplyChange={(newItem) => updateEducation(education.id, {
                    ...(newItem.degree !== undefined && { degree: String(newItem.degree) }),
                    ...(newItem.institution !== undefined && { institution: String(newItem.institution) }),
                    ...(newItem.startDate !== undefined && { startDate: new Date(String(newItem.startDate)) }),
                    ...(newItem.endDate !== undefined && { endDate: new Date(String(newItem.endDate)) }),
                    ...(newItem.description !== undefined && { description: sanitizeHtml(String(newItem.description)) }),
                })}
            />
        </div>
    )
}

const EducationMain:React.FC = () => {

    const education = useCvEditStore((state) => state.education);
    const removeEducation = useCvEditStore((state) => state.removeEducation);
    
    return (
        <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
            {
                education.map((edu) => (
                    <div key={edu.id} >
                        <Collapsable 
                            title={edu.degree ? edu.degree : "Untitled"} 
                            children={<EducationComponent education={edu}/>} 
                            onDelete={() => removeEducation(edu.id)}
                        />
                    </div>
                ))
            }
        </div>
    )
}

export default EducationMain;