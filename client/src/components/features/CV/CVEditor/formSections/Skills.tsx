import React, { useContext } from 'react';
import { useCvEditStore } from '../../../../../Store';
import { Skill } from '../../../../../interfaces/cv';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../../UI';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { CollapsableAiContext } from '../../../../UI/Collapsable';
import { AiPanel } from '../../../../UI/TextEditor/AiAssistant';
import { useTranslation } from 'react-i18next';
import cvI18n from '../../../../../i18n/cvi18n';

interface ComponentProps {
    skill: Skill
}

const { skills: skillsConstants } = CV_EDITOR_FORM_CONSTANTS.sections
const { fields: fieldsConstants } = skillsConstants;

const SkillComponent: React.FC<ComponentProps> = ({ skill }) => {
    const updateSkill = useCvEditStore((state) => state.updateSkill);

    const collapsableCtx = useContext(CollapsableAiContext);
    const aiOpen = collapsableCtx ? collapsableCtx.aiOpen : false;

    const { t } = useTranslation('cvTemplate', { keyPrefix: 'sections.skills.Levels', i18n: cvI18n });
    const SkillsLevelsMap = {
        1:  { index: 0, color: '#da4500', label: t('beginner') },
        2:  { index: 1, color: '#ffd413', label: t('intermediate') },
        3:  { index: 2, color: '#5cd41c', label: t('advanced') },
        4:  { index: 3, color: '#41bc00', label: t('expert') }
    }

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
                    onLevelChange={(id: string, level: number) => updateSkill(id, { level })}
                />


            </div>
            <AiPanel 
                isOpen={aiOpen}
                sectionType="skills"
                contentId={skill.id}
                currentItem={{ name: skill.name, level: skill.level }}
                onApplyChange={(newItem) => updateSkill(skill.id, {
                    ...(newItem.name !== undefined && { name: String(newItem.name) }),
                })}
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