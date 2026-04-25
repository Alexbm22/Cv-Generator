import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { Education as EducationType } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";

interface EducationSectionProps {
    education: EducationType[];
}

const { education: educationConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
    if (education.length === 0) {
        education = educationConstants.default as EducationType[];
    }

    return (
        <Section title={educationConstants.title}>
            <View>
                {education.map((entry) => (
                    <SectionEntry
                        key={entry.id}
                        title={entry.degree}
                        subtitle={entry.institution}
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                        description={entry.description}
                    />
                ))}
            </View>
        </Section>
    );
};

export default EducationSection;
