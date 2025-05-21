import React from "react";
import { useCvStore } from "../../../../../Store";
import { CVPreviewContent } from "../../../../../config/content";
import { SkillLevel } from "../../../../../interfaces/cv_interface";
import { SkillsLevelsMap } from "../../../../../config/proficiency";

interface SkillsProps {
    componentClassName: string;
    titleClassName: string;
    skillNameClassName: string;
    skillLevelClassName: string;
    skillLevelBarClassName: string;
    skillLevelBarBackgroundClassName: string;
}

const Skills: React.FC<SkillsProps> = ({
    componentClassName,
    titleClassName,
    skillNameClassName,
    skillLevelClassName,
    skillLevelBarClassName,
    skillLevelBarBackgroundClassName,
}) => {

    const { skills: skillsContent } = CVPreviewContent.sections;
    const { skills } = useCvStore();

    return (
        <>
            <div className={componentClassName}>
                <h1 className={titleClassName}>{skillsContent.title}</h1>
                {
                    skills.map((skill, index) => {
                        const skillLevel = skill.level as SkillLevel;
                        if (!skillLevel) return null; // verify if skillLevel is defined

                        const skillName = skill.name != '' ? skill.name + ':' : '';
                        const skillLevelName = skillLevel || SkillsLevelsMap[skillLevel];
                        const levelBarWidth = `${((SkillsLevelsMap[skillLevel].index + 1) / Object.keys(SkillsLevelsMap).length) * 100}%`;

                        return (
                            <div key={index} className="flex flex-col mt-2 items-start w-full" >
                                <div className="flex flex-row gap-2 w-full mb-2">
                                    <h1 className={skillNameClassName}>{skillName}</h1>
                                    <h1 className={skillLevelClassName}>{skillLevelName}</h1>
                                </div>

                                <div className={skillLevelBarBackgroundClassName}>
                                    <div 
                                        className={skillLevelBarClassName} 
                                        style={{ width: levelBarWidth }}>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
};

export default Skills;