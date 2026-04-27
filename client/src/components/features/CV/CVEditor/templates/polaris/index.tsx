import React from 'react';
import { Page, View, Document, StyleSheet } from '@react-pdf/renderer';
import * as CVComponents from './components';
import { TemplateComponentProps } from '../../../../../../interfaces/cv';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: 'white',
        color: '#1a1a1a',
    },
    pageContainer: {
        flexDirection: 'column',
        height: '100%',
        width: '100%',
    },
    bar: {
        width: '50%',
        height: 14,
        marginLeft: 40,
        backgroundColor: '#1a1a1a',
    },
    barTop: {
        position: 'absolute',
    },
    content: {
        flex: 1,
        paddingHorizontal: 40,
        paddingVertical: 28,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 12,
        fontFamily: 'Times-Roman',
    },
    body: {
        flex: 1,
    },
});

const sections = ['aboutMe', 'workExperience', 'education', 'projects', 'customSections', 'socialLinks', 'skills', 'languages'];
const DEFAULT_SECTIONS_ORDER = sections.map((section) => ({ id: section, isVisible: true }));

const Polaris: React.FC<TemplateComponentProps> = ({ CV }) => {
    const sectionsOrder = CV.sectionsOrder.length > 0
        ? CV.sectionsOrder
        : DEFAULT_SECTIONS_ORDER;

    const isVisible = (id: string) =>
        sectionsOrder.find((s) => s.id === id)?.isVisible ?? true;

    const sectionsMapping: Record<string, React.ReactNode> = {
        aboutMe: (
            <CVComponents.AboutMe
                key="aboutMe"
                professionalSummary={CV.professionalSummary}
            />
        ),
        workExperience: (
            <CVComponents.WorkExperience
                key="workExperience"
                workExperience={CV.workExperience}
            />
        ),
        education: (
            <CVComponents.Education
                key="education"
                education={CV.education}
            />
        ),
        projects: (
            <CVComponents.Projects
                key="projects"
                projects={CV.projects}
            />
        ),
        customSections: (
            <CVComponents.CustomSection
                key="customSections"
                customSection={CV.customSections}
            />
        ),
    };

    const sectionComponents = sectionsOrder
        .filter((section) => section.isVisible && sectionsMapping[section.id])
        .map((section) => sectionsMapping[section.id]);

    return (
        <Document>
            <Page size='A4' style={styles.page}>
                <View style={styles.pageContainer}>
                    <View style={[styles.bar, styles.barTop, { backgroundColor: CV.templateColor }]} />
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <CVComponents.Name
                                firstName={CV.firstName}
                                lastName={CV.lastName}
                                jobTitle={CV.jobTitle}
                            />
                            <CVComponents.GeneralInfos
                                phoneNumber={CV.phoneNumber}
                                email={CV.email}
                                address={CV.address}
                                birthDate={CV.birthDate}
                            />
                        </View>
                        <View style={styles.body}>
                            {sectionComponents}
                            <CVComponents.SkillsAndOther
                                skills={CV.skills}
                                skillsVisible={isVisible('skills')}
                                languages={CV.languages}
                                languagesVisible={isVisible('languages')}
                                socialLinks={CV.socialLinks}
                                socialLinksVisible={isVisible('socialLinks')}
                            />
                        </View>
                    </View>
                    <View style={[styles.bar, { backgroundColor: CV.templateColor }]} />
                </View>
            </Page>
        </Document>
    );
};

export default Polaris;
