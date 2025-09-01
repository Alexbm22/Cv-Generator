import React from 'react';
import { useCvEditStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../../UI/Collapsable';
import TextInputField from '../../../../UI/textInputField';
import { sanitizeHtml } from '../../../../../utils';
import { Education } from '../../../../../interfaces/cv';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';

interface ComponentProps {
    education: Education
}

const { education: educationConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = educationConstants;

const EducationComponent:React.FC<ComponentProps> = ({ education }) => {

    const updateEducation = useCvEditStore((state) => state.updateEducation);

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`degree-${education.id}`}
                    label={fieldsConstants.degree.label}
                    placeholder={fieldsConstants.degree.placeholder}
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, { degree: e.target.value })}
                />

                <TextInputField
                    id={`institution-${education.id}`}
                    label={fieldsConstants.institution.label}
                    placeholder={fieldsConstants.institution.placeholder}
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, { institution: e.target.value })}
                />

                <TextInputField
                    type={fieldsConstants.start_date.type}
                    id={`startDate-${education.id}`}
                    label={fieldsConstants.start_date.label}
                    placeholder={fieldsConstants.start_date.placeholder}
                    value={new Date(education.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
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
            />
        </div>
    )
}

const EducationMain:React.FC = () => {

    const education = useCvEditStore((state) => state.education);
    const addEducation = useCvEditStore((state) => state.addEducation);
    const removeEducation = useCvEditStore((state) => state.removeEducation);
    
    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{educationConstants.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{educationConstants.description}</p>
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
                <button onClick={() => addEducation()} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    {educationConstants.add_button_text}
                </button>
            </div>
        </div>
    )
}

export default EducationMain;