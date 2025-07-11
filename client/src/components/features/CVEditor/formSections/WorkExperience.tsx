import React from 'react';
import { useCvEditStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { WorkExperience } from '../../../../interfaces/cv_interface';
import { CVEditContent } from '../../../../config/content';

interface ComponentProps {
    work: WorkExperience
}

const WorkExperienceComponent:React.FC<ComponentProps> = ({ work }) => {

    const updateWorkExperience = useCvEditStore((state) => state.updateWorkExperience);
    const { workExperience } = CVEditContent.formSections;
    const { fields } = workExperience;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`title-${work.id}`}
                    label={fields.jobTitle.label}
                    placeholder={fields.jobTitle.placeholder}
                    value={work.jobTitle}
                    onChange={(e) => updateWorkExperience(work.id, { jobTitle: e.target.value })}
                />

                <TextInputField
                    id={`company-${work.id}`}
                    label={fields.companyName.label}
                    placeholder={fields.companyName.placeholder}
                    value={work.company}
                    onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
                />

                <TextInputField
                    type='date'
                    id={`startDate-${work.id}`}
                    label={fields.startDate.label}
                    placeholder={fields.startDate.placeholder}
                    value={new Date(work.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateWorkExperience(work.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
                    type='date'
                    id={`endDate-${work.id}`}
                    placeholder={fields.endDate.placeholder}
                    label={fields.endDate.label}
                    value={new Date(work.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateWorkExperience(work.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor
                htmlContent={work.description}
                onHtmlChange={(html) => updateWorkExperience(work.id, { description: sanitizeHtml(html) })}
                placeholder={fields.description.placeholder}
            />
        </div>
    )
}

const WorkExperienceMain: React.FC = () => {
    
    const workExperience = useCvEditStore((state) => state.workExperience);
    const addWorkExperience = useCvEditStore((state) => state.addWorkExperience);
    const removeWorkExperience = useCvEditStore((state) => state.removeWorkExperience);

    const { workExperience: workExperienceContent } = CVEditContent.formSections;

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{workExperienceContent.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{workExperienceContent.description}</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                {
                    workExperience.map((work) => (
                        <div key={work.id} >
                            <Collapsable 
                                title={work.jobTitle ? work.jobTitle : "Untitled"} 
                                children={<WorkExperienceComponent work={work}/>} 
                                onDelete={() => removeWorkExperience(work.id)}
                            />
                        </div>
                    ))
                }
                <button onClick={() => addWorkExperience({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    {workExperienceContent.addText}
                </button>
            </div>
        </div>
    );
}

export default WorkExperienceMain;