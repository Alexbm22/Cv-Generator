import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Skill, SkillLevel } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";
import { SkillsLevelsMap } from "../../../../../../../constants/CV/skillLevelsMap";
import LevelBarItem from "../../shared/LevelBarItem";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 8,
        marginBottom: 36,
    },
    title: {
        fontWeight: 1000,
        fontSize: 15
    },
    contentContainer: {
        gap: 10
    },
})

type SkillsProps = {
    skills: Skill[]
}

const { skills: skillsConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const Skills: React.FC<SkillsProps> = ({
    skills
}) => {

    if (skills.length === 0) {
        skills = skillsConstants.default as Skill[];
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{skillsConstants.title}</Text>
            <View style={styles.contentContainer}>
                {
                    skills.map((skill, index) => {

                        const skillLevel = skill.level as SkillLevel;
                        if (!skillLevel) return null;

                        const skillName = skill.name !== '' ? skill.name + ': ' : '';
                        const levelLabel = skillLevel;
                        const levelBarWidth = `${((SkillsLevelsMap[skillLevel].index + 1) / Object.keys(SkillsLevelsMap).length) * 100}%`;

                        return (
                            <LevelBarItem
                                key={skill.id ?? index}
                                name={skillName}
                                levelLabel={levelLabel}
                                levelBarWidth={levelBarWidth}
                            />
                        )
                    })
                }
            </View>
        </View>
    );
}

export default Skills;
