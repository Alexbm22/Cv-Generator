import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Language } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";
import LevelBarItem from "../../shared/LevelBarItem";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 8,
        marginBottom: 36,
    },
    title: {
        fontWeight: 1000, // to do: repair the fontweight error
        fontSize: 15
    },
    contentContainer: {
        gap: 10
    },

})

type languagesProps = { 
    languages: Language[]
}

const Languages: React.FC<languagesProps> = ({
    languages
}) => {
    const parsedDefaultLanguages: Language[] = (() => {
        if (languages.length > 0) return languages;

        try {
            return JSON.parse(cvI18n.t('sections.languages.default')) as Language[];
        } catch {
            return [];
        }
    })();

    const LanguageLevelsMap = {
        1:  { index: 0, color: '#da4500', displayedVal: 'A1', label: 'A1 - ' + cvI18n.t('sections.languages.Levels.beginner') },
        2:  { index: 1, color: '#ffac33', displayedVal: 'A2', label: 'A2 - ' + cvI18n.t('sections.languages.Levels.elementary') },
        3:  { index: 2, color: '#ffd413', displayedVal: 'B1', label: 'B1 - ' + cvI18n.t('sections.languages.Levels.intermediate') },
        4:  { index: 3, color: '#7ad96d', displayedVal: 'B2', label: 'B2 - ' + cvI18n.t('sections.languages.Levels.upperIntermediate') },
        5:  { index: 4, color: '#5cd41c', displayedVal: 'C1', label: 'C1 - ' + cvI18n.t('sections.languages.Levels.advanced') },
        6:  { index: 5, color: '#41bc00', displayedVal: 'C2', label: 'C2 - ' + cvI18n.t('sections.languages.Levels.proficient') }
    }

    const normalizeLanguageLevel = (rawLevel: Language['level'] | string | number | null | undefined): 1 | 2 | 3 | 4 | 5 | 6 | null => {
        if (typeof rawLevel === 'number' && rawLevel >= 1 && rawLevel <= 6) {
            return rawLevel as 1 | 2 | 3 | 4 | 5 | 6;
        }

        if (typeof rawLevel !== 'string') {
            return null;
        }

        const normalized = rawLevel.trim().toLowerCase();
        if (!normalized) {
            return null;
        }

        const numericLevel = Number(normalized);
        if (!Number.isNaN(numericLevel) && numericLevel >= 1 && numericLevel <= 6) {
            return numericLevel as 1 | 2 | 3 | 4 | 5 | 6;
        }

        const cefrMatch = normalized.match(/\b(a1|a2|b1|b2|c1|c2)\b/i);
        if (cefrMatch) {
            const cefrToLevelMap: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
                a1: 1,
                a2: 2,
                b1: 3,
                b2: 4,
                c1: 5,
                c2: 6,
            };

            return cefrToLevelMap[cefrMatch[1].toLowerCase()] ?? null;
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{cvI18n.t('sections.languages.title')}</Text>
            <View style={styles.contentContainer}>
                {
                    parsedDefaultLanguages.map((language) => {

                        const LanguageLevel = normalizeLanguageLevel(language?.level as Language['level'] | string | number | null | undefined);
                        if (!LanguageLevel) return null; // verify if languagelevel is defined

                        const languageName = language?.name ? language.name + ': ' : '';
                        const languageLevelName =  LanguageLevelsMap[LanguageLevel];
                        const levelBarWidth = `${((LanguageLevelsMap[LanguageLevel].index + 1) / Object.keys(LanguageLevelsMap).length) * 100}%`;

                        return (
                            <LevelBarItem
                                key={language.id}
                                name={languageName}
                                levelLabel={languageLevelName.label}
                                levelBarWidth={levelBarWidth}
                            />
                        )
                    })
                }
            </View>
        </View>
    );
}

export default Languages;