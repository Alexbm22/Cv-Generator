import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { WorkExperience as WorkExperienceType } from "../../../../../../../interfaces/cv";

interface WorkExperienceSectionProps {
    workExperience: WorkExperienceType[];
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ workExperience }) => {
    if (workExperience.length === 0) return null;

    return (
        <Section title="Work Experience">
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
