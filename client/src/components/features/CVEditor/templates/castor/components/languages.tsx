import React from "react";
import { useCvEditStore } from "../../../../../../Store";
import { CVPreviewContent } from "../../../../../../config/content";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { LanguageLevelsMap } from "../../../../../../config/proficiency";
import { ProficiencyLanguageLevel } from "../../../../../../interfaces/cv";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 8,
    },
    title: {
        fontWeight: 1000, // to do: repair the fontweight error
        fontSize: 15
    },
    contentContainer: {
        gap: 10
    },
    LanguageContainer: {
        gap: 7
    },
    LanguageTopContainer: {
        flexDirection: 'row',
        gap: 10
    },
    LanguageTitle: {
        fontSize: 12
    },
    LanguageLevel: {
        fontSize: 12,
        textDecoration: 'none',
        color: 'white'
    },
    LanguageLevelBar: {
        container: {
            width: '100%',
            height: 3,
            position: 'relative' as const
        },
        background: {
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            opacity: 0.3,
            position: 'absolute' as const
        },
        foreground: {
            backgroundColor: 'white',
            height: '100%',
            position: 'absolute' as const
        }
    }
})

const Languages: React.FC = () => {

    const { languages: languagesContent } = CVPreviewContent.sections;
    const languages = useCvEditStore((state) => state.languages);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{languagesContent.title}</Text>
            <View style={styles.contentContainer}>
                {
                    languages.length === 0 ? (
                        <View style={styles.LanguageContainer}>
                            <View style={styles.LanguageTopContainer}>
                                <Text style={styles.LanguageTitle}>{languagesContent.default.language}</Text>
                                <Text style={styles.LanguageLevel} >{languagesContent.default.level}</Text>
                            </View>
                            <View style={styles.LanguageLevelBar.container}>
                                <View style={styles.LanguageLevelBar.background}>
                                </View>
                                <View style={[styles.LanguageLevelBar.foreground, {width: 
                                    `${((LanguageLevelsMap[languagesContent.default.level].index + 1) / Object.keys(LanguageLevelsMap).length) * 100}%`
                                 }]}>
                                </View>
                            </View>
                        </View>
                        
                        
                    ) : (
                        languages.map((language, index) => {

                            const LanguageLevel = language.level as ProficiencyLanguageLevel;
                            if (!LanguageLevel) return null; // verify if languagelevel is defined
    
                            const languageName = language.name != '' ? language.name + ': ' : '';
                            const languageLevelName = LanguageLevel || LanguageLevelsMap[LanguageLevel];
                            const levelBarWidth = `${((LanguageLevelsMap[LanguageLevel].index + 1) / Object.keys(LanguageLevelsMap).length) * 100}%`;

                            return (
                                <View style={styles.LanguageContainer}>
                                    <View  style={styles.LanguageTopContainer} key={index}>
                                        <Text style={styles.LanguageTitle}>{languageName}</Text>
                                        <Text style={styles.LanguageLevel}>{languageLevelName}</Text>
                                    </View>
                                    <View style={styles.LanguageLevelBar.container}>
                                        <View style={styles.LanguageLevelBar.background}>
                                        </View>
                                        <View style={[styles.LanguageLevelBar.foreground, {width: levelBarWidth }]}>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    )
                }
            </View>
        </View>
    );
}

export default Languages;