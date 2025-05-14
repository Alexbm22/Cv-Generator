import React from 'react';
import { useCvStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { WorkExperience } from '../../../../interfaces/cv_interface';

interface ComponentProps {
    work: WorkExperience
}

const WorkExperienceComponent:React.FC<ComponentProps> = ({ work }) => {

    const { updateWorkExperience } = useCvStore();

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans md:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`title-${work.id}`}
                    label="Job Title:"
                    placeholder="e.g. Software Engineer"
                    value={work.jobTitle}
                    onChange={(e) => updateWorkExperience(work.id, { jobTitle: e.target.value })}
                />

                <TextInputField
                    id={`company-${work.id}`}
                    label="Company:"
                    placeholder="Company Name"
                    value={work.company}
                    onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
                />

                <TextInputField
                    type='date'
                    id={`startDate-${work.id}`}
                    label="Start Date:"
                    placeholder=''
                    value={new Date(work.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateWorkExperience(work.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
                    type='date'
                    id={`endDate-${work.id}`}
                    placeholder=''
                    label="End Date:"
                    value={new Date(work.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateWorkExperience(work.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor 
                htmlContent={work.description} 
                onHtmlChange={(html) => updateWorkExperience(work.id, { description: sanitizeHtml(html) })} 
                placeholder="Write a brief description of your responsibilities and achievements in this role."
            />
        </div>
    )
}

const WorkExperienceMain: React.FC = () => {

    const {
        workExperience,
        addWorkExperience,
        removeWorkExperience,
    } = useCvStore();

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">Work Experience</h2>
            <p className="text-sm text-gray-500 mb-4">Add your work experience details here.</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-5 mt-3">
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
                                + Add Work Experience
                            </button>
                        </div>
        </div>
    );
}

export default WorkExperienceMain;