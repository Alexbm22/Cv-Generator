import React from 'react';
import { useCvStore } from '../../../../Store';
import { Skill, SkillLevel } from '../../../../interfaces/cv_interface';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../UI';
import { SkillsLevelsMap } from '../../../../config/proficiency';
import { CVEditContent } from '../../../../config/content';

interface ComponentProps {
    skill: Skill
}

const SkillComponent: React.FC<ComponentProps> = ({ skill }) => {
    const { updateSkill } = useCvStore();
    const { skills: skillsContent } = CVEditContent.formSections;
    const { fields } = skillsContent;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`skill-${skill.id}`}
                    label={fields.skill.label}
                    placeholder={fields.skill.placeholder}
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                />

                <SliderPicker
                    LevelsMap={SkillsLevelsMap}
                    selectedLevel={skill.level}
                    sectionId={skill.id}
                    onLevelChange={(id: string, level: SkillLevel) => updateSkill(id, { level })}
                />

            </div>
        </div>
    )
}

const SkillMain:React.FC = () => {
    const { skills, addSkill, removeSkill } = useCvStore();
    const { skills: skillsContent } = CVEditContent.formSections;

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{skillsContent.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{skillsContent.description}</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                {
                    skills.map((skill) => (
                        <div key={skill.id} >
                            <Collapsable
                                title={skill.name ? skill.name : "Untitled"}
                                children={<SkillComponent skill={skill} />}
                                onDelete={() => removeSkill(skill.id)}
                            />
                        </div>
                    ))
                }
                <button onClick={() => addSkill({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    {skillsContent.addText}
                </button>
            </div>
        </div>
    )
}

export default SkillMain;