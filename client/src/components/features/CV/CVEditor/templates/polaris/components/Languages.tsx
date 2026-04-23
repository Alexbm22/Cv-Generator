import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Language, ProficiencyLanguageLevel } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";
import SectionHeader from "../../shared/SectionHeader";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 2,
    },
    item: {
        fontSize: 10,
        color: '#333333',
    },
    separator: {
        fontSize: 10,
        color: '#aaaaaa',
    },
});

type LanguagesProps = {
    languages: Language[];
};

const { languages: languagesConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const Languages: React.FC<LanguagesProps> = ({ languages }) => {
    if (languages.length === 0) {
        languages = languagesConstants.default;
    }

    const validLanguages = languages.filter((language) => {
        const languageLevel = language.level as ProficiencyLanguageLevel;
        return !!languageLevel;
    });

    return (
        <View style={styles.container}>
            <SectionHeader title={languagesConstants.title} />
            <View style={styles.itemsContainer}>
                {validLanguages.map((language, index) => {
                    const languageName = language.name !== '' ? language.name : '';
                    const levelLabel = language.level as ProficiencyLanguageLevel;
                    const label = languageName ? `${languageName}: ${levelLabel}` : levelLabel;

                    return (
                        <React.Fragment key={language.id}>
                            <Text style={styles.item}>{label}</Text>
                            {index < validLanguages.length - 1 && (
                                <Text style={styles.separator}>|</Text>
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
};

export default Languages;
