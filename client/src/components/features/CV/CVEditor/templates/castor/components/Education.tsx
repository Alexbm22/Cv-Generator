import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { Education as EducationType } from "../../../../../../../interfaces/cv";

interface EducationSectionProps {
    education: EducationType[];
}

const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
    if (education.length === 0) return null;

    return (
        <Section title="Education">
            <View>
                {education.map((entry) => (
                    <SectionEntry
                        key={entry.id}
                        title={entry.degree}
                        subtitle={entry.institution}
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                        description={entry.description}
                        bulleted
                    />
                ))}
            </View>
        </Section>
    );
};

export default EducationSection;
