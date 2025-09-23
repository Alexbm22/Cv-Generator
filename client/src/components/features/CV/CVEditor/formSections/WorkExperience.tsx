import React from 'react';
import { useCvEditStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../../UI/Collapsable';
import TextInputField from '../../../../UI/textInputField';
import AddSectionButton from '../../../../UI/AddSectionButton';
import { sanitizeHtml } from '../../../../../utils';
import { WorkExperience } from '../../../../../interfaces/cv';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';

interface ComponentProps {
    work: WorkExperience
}

const { work_experience: workExperienceConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = workExperienceConstants;

const WorkExperienceComponent:React.FC<ComponentProps> = ({ work }) => {

    const updateWorkExperience = useCvEditStore((state) => state.updateWorkExperience);

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`title-${work.id}`}
                    label={fieldsConstants.job_title.label}
                    placeholder={fieldsConstants.job_title.placeholder}
                    value={work.jobTitle}
                    onChange={(e) => updateWorkExperience(work.id, { jobTitle: e.target.value })}
                />

                <TextInputField
                    id={`company-${work.id}`}
                    label={fieldsConstants.company_name.label}
                    placeholder={fieldsConstants.company_name.placeholder}
                    value={work.company}
                    onChange={(e) => updateWorkExperience(work.id, { company: e.target.value })}
                />

                <TextInputField
                    type='date'
                    id={`startDate-${work.id}`}
                    label={fieldsConstants.start_date.label}
                    placeholder={fieldsConstants.start_date.placeholder}
                    value={new Date(work.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateWorkExperience(work.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
                    type='date'
                    id={`endDate-${work.id}`}
                    placeholder={fieldsConstants.end_date.placeholder}
                    label={fieldsConstants.end_date.label}
                    value={new Date(work.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateWorkExperience(work.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor
                htmlContent={work.description}
                onHtmlChange={(html) => updateWorkExperience(work.id, { description: sanitizeHtml(html) })}
                placeholder={fieldsConstants.description.placeholder}
            />
        </div>
    )
}

const WorkExperienceMain: React.FC = () => {
    
    const workExperience = useCvEditStore((state) => state.workExperience);
    const addWorkExperience = useCvEditStore((state) => state.addWorkExperience);
    const removeWorkExperience = useCvEditStore((state) => state.removeWorkExperience);

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{workExperienceConstants.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{workExperienceConstants.description}</p>
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
                <AddSectionButton OnClick={() => addWorkExperience()} sectionName={'Work Experience'} />
            </div>
        </div>
    );
}

export default WorkExperienceMain;