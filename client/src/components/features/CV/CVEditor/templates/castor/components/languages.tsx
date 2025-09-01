import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Language, ProficiencyLanguageLevel } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";
import { LanguageLevelsMap } from "../../../../../../../constants/CV/languageLevelsMap";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 8,
        marginBottom: '50%'
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

type languagesProps = { 
    languages: Language[]
}

const { languages: languagesConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const Languages: React.FC<languagesProps> = ({
    languages
}) => {

    if(languages.length === 0) {
        languages = languagesConstants.default
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{languagesConstants.title}</Text>
            <View style={styles.contentContainer}>
                {
                    languages.map((language, index) => {

                        const LanguageLevel = language.level as ProficiencyLanguageLevel;
                        if (!LanguageLevel) return null; // verify if languagelevel is defined

                        const languageName = language.name != '' ? language.name + ': ' : '';
                        const languageLevelName = LanguageLevel || LanguageLevelsMap[LanguageLevel];
                        const levelBarWidth = `${((LanguageLevelsMap[LanguageLevel].index + 1) / Object.keys(LanguageLevelsMap).length) * 100}%`;

                        return (
                            <View key={language.id} style={styles.LanguageContainer}>
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
                }
            </View>
        </View>
    );
}

export default Languages;