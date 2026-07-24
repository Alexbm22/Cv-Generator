import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Skill, SkillLevel } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";
import SectionHeader from "../../shared/SectionHeader";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 2,
    },
    item: {
        fontSize: 10,
        color: '#333333',
    },
    separator: {
        fontSize: 10,
        color: '#aaaaaa',
    },
});

type SkillsProps = {
    skills: Skill[];
};

const Skills: React.FC<SkillsProps> = ({ skills }) => {
    if (skills.length === 0) {
        skills = JSON.parse(cvI18n.t('sections.skills.default'));
    }

    const validSkills = skills.filter((skill) => {
        const skillLevel = skill.level as SkillLevel;
        return !!skillLevel;
    });

    return (
        <View style={styles.container}>
            <SectionHeader title={cvI18n.t('sections.skills.title')} />
            <View style={styles.itemsContainer}>
                {validSkills.map((skill, index) => {
                    const skillName = skill.name !== '' ? skill.name : '';
                    const levelLabel = skill.level as SkillLevel;
                    const label = skillName ? `${skillName}: ${levelLabel}` : levelLabel;

                    return (
                        <React.Fragment key={skill.id ?? index}>
                            <Text style={styles.item}>{label}</Text>
                            {index < validSkills.length - 1 && (
                                <Text style={styles.separator}>|</Text>
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
};

export default Skills;
