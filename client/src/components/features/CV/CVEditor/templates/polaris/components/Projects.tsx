import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { Project } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";

interface ProjectsSectionProps {
    projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
    if (projects.length === 0) {
        projects = JSON.parse(cvI18n.t('sections.projects.default'));
    }

    return (
        <Section title={cvI18n.t('sections.projects.title')}>
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
