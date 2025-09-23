import React from 'react';
import { useCvEditStore } from '../../../../../Store';
import { Skill, SkillLevel } from '../../../../../interfaces/cv';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../../UI';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { SkillsLevelsMap } from '../../../../../constants/CV/skillLevelsMap';
import AddSectionButton from '../../../../UI/AddSectionButton';

interface ComponentProps {
    skill: Skill
}

const { skills: skillsConstants } = CV_EDITOR_FORM_CONSTANTS.sections
const { fields: fieldsConstants } = skillsConstants;

const SkillComponent: React.FC<ComponentProps> = ({ skill }) => {
    const updateSkill = useCvEditStore((state) => state.updateSkill);

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`skill-${skill.id}`}
                    label={fieldsConstants.skill.label}
                    placeholder={fieldsConstants.skill.placeholder}
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

    const addSkill = useCvEditStore((state) => state.addSkill);
    const removeSkill = useCvEditStore((state) => state.removeSkill);
    const skills = useCvEditStore((state) => state.skills);

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{skillsConstants.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{skillsConstants.description}</p>
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
                <AddSectionButton OnClick={() => addSkill()} sectionName={'Skill'} />
            </div>
        </div>
    )
}

export default SkillMain;