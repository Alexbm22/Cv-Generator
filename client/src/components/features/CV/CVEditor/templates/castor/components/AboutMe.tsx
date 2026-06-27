import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import { parseQuillToReactPDF } from "../../../../../../../utils/parseHtmlToPdf";
import cvI18n from "../../../../../../../i18n/cvi18n";

interface AboutMeProps {
    aboutMe: string;
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
})

const AboutMe: React.FC<AboutMeProps> = ({ aboutMe }) => {
    if(aboutMe === '' || aboutMe === '<p><br></p>') {
        aboutMe = cvI18n.t('sections.aboutMe.default');
    }

    const parsedContent = parseQuillToReactPDF(aboutMe);

    return (
        <Section title={cvI18n.t('sections.aboutMe.title')}>
            <View style={styles.container}>{parsedContent}</View>
        </Section>
    );
};

export default AboutMe;
