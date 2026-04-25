import React from "react";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Skill, SkillLevel, Language, ProficiencyLanguageLevel, SocialLink } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";
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

const { skills: skillsConstants, languages: languagesConstants, social_links: socialLinksConstants } =
    CV_EDITOR_TEMPLATE_CONSTANTS.sections;

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
        skills = skillsConstants.default as Skill[];
    }
    if (languages.length === 0) {
        languages = languagesConstants.default;
    }
    if (socialLinks.length === 0) {
        socialLinks = socialLinksConstants.default;
    }

    const validSkills = skills.filter((s) => !!(s.level as SkillLevel));
    const validLanguages = languages.filter((l) => !!(l.level as ProficiencyLanguageLevel));

    return (
        <View style={styles.container}>
            <SectionHeader title="Skills & Other" />

            {skillsVisible && validSkills.length > 0 ? (
                <View style={styles.row}>
                    <Text style={styles.subsectionLabel}>{skillsConstants.title}:</Text>
                    {validSkills.map((skill, index) => {
                        const label = skill.name !== '' ? `${skill.name}: ${skill.level}` : `${skill.level}`;
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
                    <Text style={styles.subsectionLabel}>{languagesConstants.title}:</Text>
                    {validLanguages.map((language, index) => {
                        const label = language.name !== '' ? `${language.name}: ${language.level}` : `${language.level}`;
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
                    <Text style={styles.subsectionLabel}>{socialLinksConstants.title}:</Text>
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
