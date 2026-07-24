import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Language } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";
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

const Languages: React.FC<LanguagesProps> = ({ languages }) => {
    if (languages.length === 0) {
        languages = JSON.parse(cvI18n.t('sections.languages.default'));
    }

    const validLanguages = languages.filter((language) => {
        const languageLevel = language.level;
        return !!languageLevel;
    });

    const LanguageLevelsMap = {
        1:  { index: 0, color: '#da4500', displayedVal: 'A1', label:  'A1 - ' + cvI18n.t('sections.languages.Levels.beginner') },
        2:  { index: 1, color: '#ffac33', displayedVal: 'A2', label: 'A2 - ' + cvI18n.t('sections.languages.Levels.elementary') },
        3:  { index: 2, color: '#ffd413', displayedVal: 'B1', label: 'B1 - ' + cvI18n.t('sections.languages.Levels.intermediate') },
        4:  { index: 3, color: '#7ad96d', displayedVal: 'B2', label: 'B2 - ' + cvI18n.t('sections.languages.Levels.upperIntermediate') },
        5:  { index: 4, color: '#5cd41c', displayedVal: 'C1', label: 'C1 - ' + cvI18n.t('sections.languages.Levels.advanced') },
        6:  { index: 5, color: '#41bc00', displayedVal: 'C2', label: 'C2 - ' + cvI18n.t('sections.languages.Levels.proficient') }
    }

    return (
        <View style={styles.container}>
            <SectionHeader title={cvI18n.t('sections.languages.title')} />
            <View style={styles.itemsContainer}>
                {validLanguages.map((language, index) => {
                    const languageName = language.name !== '' ? language.name : '';
                    const levelLabel = language.level ? LanguageLevelsMap[language.level]?.label : '';
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
