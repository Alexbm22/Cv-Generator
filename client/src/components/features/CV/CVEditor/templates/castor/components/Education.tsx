import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { Education as EducationType } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";

interface EducationSectionProps {
    education: EducationType[];
}

const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
    if (education.length === 0) {
        education = JSON.parse(cvI18n.t('sections.education.default'));
    }

    return (
        <Section title={cvI18n.t('sections.education.title')}>
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
