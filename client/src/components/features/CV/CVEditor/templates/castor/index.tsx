import React from 'react';
import { Page, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import * as CVComponents from './components';
import { TemplateComponentProps } from '../../../../../../interfaces/cv';
import { Name } from './components';

Font.register({
    family: 'Nunito Sans',
    src: '/fonts/NunitoSans.ttf',
})

const styles = StyleSheet.create({
    page: { 
        fontFamily: 'Helvetica', 
    },
    pageContainer: {
        flexDirection: 'row',
        height: '100%',
        width: '100%'
    },
    leftContainer: {
        backgroundColor: '#424242', 
        width: '35%',
        color: 'white', 
        alignItems: 'center',
        padding: 17,
        paddingTop: 30,
        paddingBottom: 0,
    },
    rightContaniner: {
        backgroundColor: 'white',
        padding: 17,
        paddingTop: 30,
        width: '65%',
        paddingBottom: 0,
        color: '#424242',
    }
})


const sections = ['aboutMe', 'workExperience', 'education', 'projects', 'customSections', 'socialLinks', 'skills', 'languages'];
const DEFAULT_SECTIONS_ORDER = sections.map((section) => ({ id: section, isVisible: true }));

const Castor: React.FC<TemplateComponentProps> = ({ CV }) => {
    const sectionsOrder = CV.sectionsOrder.length > 0
        ? CV.sectionsOrder
        : DEFAULT_SECTIONS_ORDER;

    const rightSectionsMapping: Record<string, React.ReactNode> = {
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

    const leftSectionsMapping: Record<string, React.ReactNode> = {
        socialLinks: (
            <CVComponents.SocialLinks 
                key="socialLinks"
                socialLinks={CV.socialLinks}
            />
        ),
        languages: (
            <CVComponents.Languages 
                key="languages"
                languages={CV.languages}
            />
        ),
        skills: (
            <CVComponents.Skills
                key="skills"
                skills={CV.skills}
            />
        ),
    }

    const leftComponents = sectionsOrder.filter((section) => section.isVisible && leftSectionsMapping[section.id]).map((section) => leftSectionsMapping[section.id]);
    const rightComponents = sectionsOrder.filter((section) => section.isVisible && rightSectionsMapping[section.id]).map((section) => rightSectionsMapping[section.id]);

    return (
        <Document>
            <Page size='A4' style={styles.page}>
                <View style={styles.pageContainer}>
                    <View style={[styles.leftContainer, { backgroundColor: CV.templateColor }]}>
                        <CVComponents.CVPhoto CVPhoto={CV.photo}/>
                        <CVComponents.GeneralInfos 
                            phoneNumber={CV.phoneNumber}
                            email={CV.email}
                            address={CV.address}
                            birthDate={CV.birthDate}
                        />
                        {leftComponents}
                    </View>
                    <View style={styles.rightContaniner}>
                        <View>
                            <Name firstName={CV.firstName} lastName={CV.lastName} jobTitle={CV.jobTitle} />
                        </View>
                        {rightComponents}
                    </View>
                </View>
            </Page>
        </Document>
    )
}

export default Castor;