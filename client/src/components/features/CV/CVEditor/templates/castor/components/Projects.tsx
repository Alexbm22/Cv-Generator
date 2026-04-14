import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { Project } from "../../../../../../../interfaces/cv";

interface ProjectsSectionProps {
    projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
    if (projects.length === 0) return null;

    return (
        <Section title="Projects">
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
