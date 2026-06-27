import React from "react";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Skill, Language, SocialLink } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";
import SectionHeader from "../../shared/SectionHeader";

interface SkillsAndOtherProps {
    skills: Skill[];
    skillsVisible: boolean;
    languages: Language[];
    languagesVisible: boolean;
    socialLinks: SocialLink[];
    socialLinksVisible: boolean;
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
        alignItems: 'baseline',
    },
    subsectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginRight: 4,
    },
    item: {
        fontSize: 10,
        color: '#333333',
    },
    separator: {
        fontSize: 10,
        color: '#aaaaaa',
        marginHorizontal: 4,
    },
    linkText: {
        fontSize: 10,
        color: '#333333',
        textDecoration: 'none',
    },
});

const SkillsAndOther: React.FC<SkillsAndOtherProps> = ({
    skills,
    skillsVisible,
    languages,
    languagesVisible,
    socialLinks,
    socialLinksVisible,
}) => {
    const showSection = skillsVisible || languagesVisible || socialLinksVisible;
    if (!showSection) return null;

    if (skills.length === 0) {
        skills = JSON.parse(cvI18n.t('sections.skills.default'));
    }
    if (languages.length === 0) {
        languages = JSON.parse(cvI18n.t('sections.languages.default'));
    }
    if (socialLinks.length === 0) {
        socialLinks = JSON.parse(cvI18n.t('sections.socialLinks.default'));
    }

    const validSkills = skills.filter((s) => !!(s.level));
    const validLanguages = languages.filter((l) => !!l.level);

    const languageLevelsMap: Record<NonNullable<Language['level']>, string> = {
        1: 'A1 - ' + cvI18n.t('sections.languages.Levels.beginner'),
        2: 'A2 - ' + cvI18n.t('sections.languages.Levels.elementary'),
        3: 'B1 - ' + cvI18n.t('sections.languages.Levels.intermediate'),
        4: 'B2 - ' + cvI18n.t('sections.languages.Levels.upperIntermediate'),
        5: 'C1 - ' + cvI18n.t('sections.languages.Levels.advanced'),
        6: 'C2 - ' + cvI18n.t('sections.languages.Levels.proficient'),
    };

    const skillLevelsMap: Record<NonNullable<Skill['level']>, string> = {
        1: cvI18n.t('sections.skills.Levels.beginner'),
        2: cvI18n.t('sections.skills.Levels.intermediate'),
        3: cvI18n.t('sections.skills.Levels.advanced'),
        4: cvI18n.t('sections.skills.Levels.expert'),
    };

    return (
        <View style={styles.container}>
            <SectionHeader title={cvI18n.t('sections.skillsAndOther.title')} />

            {skillsVisible && validSkills.length > 0 ? (
                <View style={styles.row}>
                    <Text style={styles.subsectionLabel}>{cvI18n.t('sections.skills.title')}:</Text>
                    {validSkills.map((skill, index) => {
                        const levelLabel = skill.level ? (skillLevelsMap[skill.level] ?? `${skill.level}`) : '';
                        const label = skill.name !== '' ? `${skill.name}: ${levelLabel}` : levelLabel;
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
            ) : null}

            {languagesVisible && validLanguages.length > 0 ? (
                <View style={styles.row}>
                    <Text style={styles.subsectionLabel}>{cvI18n.t('sections.languages.title')}:</Text>
                    {validLanguages.map((language, index) => {
                        const levelLabel = language.level ? (languageLevelsMap[language.level] ?? `${language.level}`) : '';
                        const label = language.name !== '' ? `${language.name}: ${levelLabel}` : levelLabel;
                        return (
                            <React.Fragment key={language.id}>
                                <Text style={styles.item}>{label}</Text>
                                {index < validLanguages.length - 1 ? (
                                    <Text style={styles.separator}>|</Text>
                                ) : null}
                            </React.Fragment>
                        );
                    })}
                </View>
            ) : null}

            {socialLinksVisible && socialLinks.length > 0 ? (
                <View style={styles.row}>
                    <Text style={styles.subsectionLabel}>{cvI18n.t('sections.socialLinks.title')}:</Text>
                    {socialLinks.map((link, index) => {
                        const platformLabel = link.platform !== '' ? `${link.platform}: ` : '';
                        const linkUrl = link.url !== '' ? 'https://' + link.url : '';
                        return (
                            <React.Fragment key={index}>
                                {platformLabel !== '' ? (
                                    <Text style={styles.item}>{platformLabel}</Text>
                                ) : null}
                                <Link src={linkUrl} style={styles.linkText}>{link.url}</Link>
                                {index < socialLinks.length - 1 ? (
                                    <Text style={styles.separator}>|</Text>
                                ) : null}
                            </React.Fragment>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
};

export default SkillsAndOther;
