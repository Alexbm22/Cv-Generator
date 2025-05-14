import React from 'react';
import { useCvStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { Education } from '../../../../interfaces/cv_interface';

interface ComponentProps {
    education: Education
}

const EducationComponent:React.FC<ComponentProps> = ({ education }) => {

    const { updateEducation } = useCvStore();

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans md:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`degree-${education.id}`}
                    label="Degree:"
                    placeholder="e.g. Bachelor of Science in Computer Science"
                    value={education.degree}
                    onChange={(e) => updateEducation(education.id, { degree: e.target.value })}
                />

                <TextInputField
                    id={`institution-${education.id}`}
                    label="Institution:"
                    placeholder="Institution Name"
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, { institution: e.target.value })}
                />

                <TextInputField
                    type='date'
                    id={`startDate-${education.id}`}
                    label="Start Date:"
                    placeholder=''
                    value={new Date(education.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
                    type='date'
                    id={`endDate-${education.id}`}
                    placeholder=''
                    label="End Date:"
                    value={new Date(education.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateEducation(education.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor 
                htmlContent={education.description} 
                onHtmlChange={(html) => updateEducation(education.id, { description: sanitizeHtml(html) })} 
                placeholder="Write a brief description of your studies and any relevant projects or achievements."
            />
        </div>
    )
}

const EducationMain:React.FC = () => {
    const { education, addEducation, removeEducation } = useCvStore();

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">Education</h2>
            <p className="text-sm text-gray-500 mb-4">Indicate the exact title of the degree or training, specifying if obtained and the distinction (most recent only).</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-5 mt-3">
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
                    + Add Work Experience
                </button>
            </div>
        </div>
    )
}

export default EducationMain;