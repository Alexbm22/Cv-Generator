import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import { parseQuillToReactPDF } from "../../../../../../../utils/parseHtmlToPdf";

interface AboutMeProps {
    professionalSummary: string;
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
})

const AboutMe: React.FC<AboutMeProps> = ({ professionalSummary }) => {
    const parsedContent = parseQuillToReactPDF(professionalSummary);

    return (
        <Section title="About Me">
            <View style={styles.container}>{parsedContent}</View>
        </Section>
    );
};

export default AboutMe;
