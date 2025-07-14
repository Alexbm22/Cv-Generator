import React from 'react';
import { useCvEditStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { Education } from '../../../../interfaces/cv';
import { CVEditContent } from '../../../../config/content';

interface ComponentProps {
    education: Education
}

const EducationComponent:React.FC<ComponentProps> = ({ education }) => {

    const updateEducation = useCvEditStore((state) => state.updateEducation);
    const { education: educationContent } = CVEditContent.formSections;
    const { fields } = educationContent;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`degree-${education.id}`}
                    label={fields.degree.label}
                    placeholder={fields.degree.placeholder}
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, { degree: e.target.value })}
                />

                <TextInputField
                    id={`institution-${education.id}`}
                    label={fields.institution.label}
                    placeholder={fields.institution.placeholder}
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, { institution: e.target.value })}
                />

                <TextInputField
                    type={fields.startDate.type}
                    id={`startDate-${education.id}`}
                    label={fields.startDate.label}
                    placeholder={fields.startDate.placeholder}
                    value={new Date(education.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
                    type={fields.endDate.type}
                    id={`endDate-${education.id}`}
                    placeholder={fields.endDate.placeholder}
                    label={fields.endDate.label}
                    value={new Date(education.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor
                htmlContent={education.description}
                onHtmlChange={(html) => updateEducation(education.id, { description: sanitizeHtml(html) })}
                placeholder={fields.descriptionPlaceholder}
            />
        </div>
    )
}

const EducationMain:React.FC = () => {

    
    const education = useCvEditStore((state) => state.education);
    const addEducation = useCvEditStore((state) => state.addEducation);
    const removeEducation = useCvEditStore((state) => state.removeEducation);

    const { education: educationContent } = CVEditContent.formSections;
    
    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{educationContent.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{educationContent.description}</p>
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
                <button onClick={() => addEducation({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    {educationContent.addText}
                </button>
            </div>
        </div>
    )
}

export default EducationMain;