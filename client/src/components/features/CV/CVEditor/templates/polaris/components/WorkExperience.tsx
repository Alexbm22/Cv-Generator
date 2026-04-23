import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { WorkExperience as WorkExperienceType } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";

interface WorkExperienceSectionProps {
    workExperience: WorkExperienceType[];
}

const { work_experience: workExperienceConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ workExperience }) => {
    if (workExperience.length === 0) {
        workExperience = workExperienceConstants.default;
    }

    return (
        <Section title={workExperienceConstants.title}>
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
