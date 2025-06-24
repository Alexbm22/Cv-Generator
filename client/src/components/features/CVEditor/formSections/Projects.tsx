import React from 'react';
import { useCvEditStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { Project } from '../../../../interfaces/cv_interface';
import { CVEditContent } from '../../../../config/content';

interface ComponentProps {
    project: Project
}

const ProjectComponent:React.FC<ComponentProps> = ({ project }) => {

    const updateProject = useCvEditStore((state) => state.updateProject);
    const { fields } = CVEditContent.formSections.projects;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`title-${project.id}`}
                    label={fields.projectName.label}
                    placeholder={fields.projectName.placeholder}
                    value={project.name}
                    onChange={(e) => updateProject(project.id, { name: e.target.value })}
                />

                <TextInputField
                    id={`URL-${project.id}`}
                    label={fields.url.label}
                    placeholder={fields.url.placeholder}
                    value={project.url}
                    onChange={(e) => updateProject(project.id, { url: e.target.value })}
                />

                <TextInputField
                    type={fields.startDate.type}
                    id={`startDate-${project.id}`}
                    label={fields.startDate.label}
                    placeholder={fields.startDate.placeholder}
                    value={new Date(project.startDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateProject(project.id, { startDate: new Date(e.target.value) })}
                />

                <TextInputField
                    type={fields.endDate.type}
                    id={`endDate-${project.id}`}
                    placeholder={fields.endDate.placeholder}
                    label={fields.endDate.label}
                    value={new Date(project.endDate).toISOString().slice(0, 10)}
                    onChange={(e) => updateProject(project.id, { endDate: new Date(e.target.value) })}
                />
            </div>

            <Editor
                htmlContent={project.description}
                onHtmlChange={(html) => updateProject(project.id, { description: sanitizeHtml(html) })}
                placeholder={fields.description.placeholder}
            />
        </div>
    )
}

const EducationMain:React.FC = () => {

    
    const projects = useCvEditStore((state) => state.projects);
    const addProject = useCvEditStore((state) => state.addProject);
    const removeProject = useCvEditStore((state) => state.removeProject);

    const { projects: projectsContent } = CVEditContent.formSections;

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{projectsContent.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{projectsContent.description}</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                {
                    projects.map((proj) => (
                        <div key={proj.id} >
                            <Collapsable
                                title={proj.name ? proj.name : "Untitled"}
                                children={<ProjectComponent project={proj} />}
                                onDelete={() => removeProject(proj.id)}
                            />
                        </div>
                    ))
                }
                <button onClick={() => addProject({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    {projectsContent.addText}
                </button>
            </div>
        </div>
    )
}

export default EducationMain;