import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { Project } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";

interface ProjectsSectionProps {
    projects: Project[];
}

const { projects: projectsConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
    if (projects.length === 0) {
        projects = projectsConstants.default as Project[];
    }

    return (
        <Section title={projectsConstants.title}>
            <View>
                {projects.map((entry) => (
                    <SectionEntry
                        key={entry.id}
                        title={entry.name}
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                        description={entry.description}
                        link={entry.url}
                    />
                ))}
            </View>
        </Section>
    );
};

export default ProjectsSection;
