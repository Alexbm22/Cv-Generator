import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Skill } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";
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

const Skills: React.FC<SkillsProps> = ({
    skills
}) => {
    const parsedDefaultSkills: Skill[] = (() => {
        if (skills.length > 0) return skills;

        try {
            return JSON.parse(cvI18n.t('sections.skills.default')) as Skill[];
        } catch {
            return [];
        }
    })();

    const SkillsLevelsMap = {
        1: { index: 0, color: '#da4500', label: cvI18n.t('sections.skills.Levels.beginner') },
        2:  { index: 1, color: '#ffd413', label: cvI18n.t('sections.skills.Levels.intermediate') },
        3:  { index: 2, color: '#5cd41c', label: cvI18n.t('sections.skills.Levels.advanced') },
        4:  { index: 3, color: '#41bc00', label: cvI18n.t('sections.skills.Levels.expert') }
    }

    const normalizeSkillLevel = (rawLevel: Skill['level'] | string | number | null | undefined): 1 | 2 | 3 | 4 | null => {
        if (typeof rawLevel === 'number' && rawLevel >= 1 && rawLevel <= 4) {
            return rawLevel as 1 | 2 | 3 | 4;
        }

        if (typeof rawLevel !== 'string') {
            return null;
        }

        const normalized = rawLevel.trim().toLowerCase();
        if (!normalized) {
            return null;
        }

        const numericLevel = Number(normalized);
        if (!Number.isNaN(numericLevel) && numericLevel >= 1 && numericLevel <= 4) {
            return numericLevel as 1 | 2 | 3 | 4;
        }

        const labelToLevelMap: Record<string, 1 | 2 | 3 | 4> = {
            beginner: 1,
            begginer: 1,
            [SkillsLevelsMap[1].label.toLowerCase()]: 1,
            intermediate: 2,
            [SkillsLevelsMap[2].label.toLowerCase()]: 2,
            advanced: 3,
            [SkillsLevelsMap[3].label.toLowerCase()]: 3,
            expert: 4,
            [SkillsLevelsMap[4].label.toLowerCase()]: 4,
        };

        return labelToLevelMap[normalized] ?? null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{cvI18n.t('sections.skills.title')}</Text>
            <View style={styles.contentContainer}>
                {
                    parsedDefaultSkills.map((skill, index) => {

                        const skillLevel = normalizeSkillLevel(skill?.level as Skill['level'] | string | number | null | undefined);
                        if (!skillLevel) return null;

                        const skillName = skill?.name ? skill.name + ': ' : '';
                        const levelLabel = SkillsLevelsMap[skillLevel].label;
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
