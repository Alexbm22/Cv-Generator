import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { WorkExperience as WorkExperienceType } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";

interface WorkExperienceSectionProps {
    workExperience: WorkExperienceType[];
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ workExperience }) => {
    if (workExperience.length === 0) {
        workExperience = JSON.parse(cvI18n.t('sections.workExperience.default'));
    }

    return (
        <Section title={cvI18n.t('sections.workExperience.title')}>
            <View>
                {workExperience.map((entry) => (
                    <SectionEntry
                        key={entry.id}
                        title={entry.jobTitle}
                        subtitle={entry.company}
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                        description={entry.description}
                    />
                ))}
            </View>
        </Section>
    );
};

export default WorkExperienceSection;
