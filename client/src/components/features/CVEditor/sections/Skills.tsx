import { useCvStore } from '../../../../Store';
import { Skill, SkillLevel } from '../../../../interfaces/cv_interface';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../UI';
import React from 'react';

interface ComponentProps {
    skill: Skill
}

const SkillComponent: React.FC<ComponentProps> = ({ skill }) => {
    const { updateSkill } = useCvStore();

    const SkillMap = {
        [SkillLevel.BEGINNER]: { index: 0, color: '#ff8e8e'},
        [SkillLevel.INTERMEDIATE]:  { index: 1, color: '#ffc65c'},
        [SkillLevel.ADVANCED]:  { index: 2, color: '#b2dc82'},
        [SkillLevel.EXPERT]:  { index: 3, color: '#72d964'}
    }

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans md:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`skill-${skill.id}`}
                    label="Skill:"
                    placeholder="e.g. JavaScript"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                />

                <SliderPicker
                    LevelsMap={SkillMap}
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

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">Skills</h2>
            <p className="text-sm text-gray-500 mb-4">Your know-how (technical) and interpersonal skills</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-5 mt-3">
                {
                    skills.map((skill) => (
                        <div key={skill.id} >
                            <Collapsable 
                                title={skill.name ? skill.name : "Untitled"} 
                                children={<SkillComponent skill={skill}/>} 
                                onDelete={() => removeSkill(skill.id)}
                            />
                        </div>
                    ))
                }
                <button onClick={() => addSkill({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    + Add New Skill
                </button>
            </div>
        </div>
    )
}

export default SkillMain;