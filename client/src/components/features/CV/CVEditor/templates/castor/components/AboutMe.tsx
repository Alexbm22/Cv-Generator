import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import { parseQuillToReactPDF } from "../../../../../../../utils/parseHtmlToPdf";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";

interface AboutMeProps {
    aboutMe: string;
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
})

const { about_me } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const AboutMe: React.FC<AboutMeProps> = ({ aboutMe }) => {
    if(aboutMe === '' || aboutMe === '<p><br></p>') {
        aboutMe = about_me.default;
    }
    
    const parsedContent = parseQuillToReactPDF(aboutMe);

    return (
        <Section title={about_me.title}>
            <View style={styles.container}>{parsedContent}</View>
        </Section>
    );
};

export default AboutMe;
