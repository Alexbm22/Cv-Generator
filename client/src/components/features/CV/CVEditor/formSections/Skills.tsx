import React, { useContext } from 'react';
import { useCvEditStore } from '../../../../../Store';
import { Skill, SkillLevel } from '../../../../../interfaces/cv';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../../UI';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { SkillsLevelsMap } from '../../../../../constants/CV/skillLevelsMap';
import { CollapsableAiContext } from '../../../../UI/Collapsable';
import { AiPanel } from '../../../../UI/TextEditor/AiAssistant';

interface ComponentProps {
    skill: Skill
}

const { skills: skillsConstants } = CV_EDITOR_FORM_CONSTANTS.sections
const { fields: fieldsConstants } = skillsConstants;

const SkillComponent: React.FC<ComponentProps> = ({ skill }) => {
    const updateSkill = useCvEditStore((state) => state.updateSkill);

    const collapsableCtx = useContext(CollapsableAiContext);
    const aiOpen = collapsableCtx ? collapsableCtx.aiOpen : false;

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
            <AiPanel 
                isOpen={aiOpen}
                sectionType="skills"
                currentContent={skill.name}
                onApplyChange={(html) => updateSkill(skill.id, { name: html })}
            />
        </div>
    )
}

const SkillMain:React.FC = () => {

    const removeSkill = useCvEditStore((state) => state.removeSkill);
    const skills = useCvEditStore((state) => state.skills);

    return (
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
        </div>
    )
}

export default SkillMain;