import React from "react";
import { View } from "@react-pdf/renderer";
import Section from "../../shared/Section";
import SectionEntry from "../../shared/SectionEntry";
import { CustomSection as CustomSectionType } from "../../../../../../../interfaces/cv";

interface CustomSectionProps {
    customSection: CustomSectionType;
}

const CustomSectionComponent: React.FC<CustomSectionProps> = ({ customSection }) => {
    if (customSection.content.length === 0 || !customSection.title) return null;

    return (
        <Section title={customSection.title}>
            <View>
                {customSection.content.map((entry) => (
                    <SectionEntry
                        key={entry.id}
                        title={entry.title}
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                        description={entry.description}
                    />
                ))}
            </View>
        </Section>
    );
};

export default CustomSectionComponent;
