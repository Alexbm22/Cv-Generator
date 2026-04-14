import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { Language, ProficiencyLanguageLevel } from "../../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";
import { LanguageLevelsMap } from "../../../../../../../constants/CV/languageLevelsMap";
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
                            <LevelBarItem
                                key={language.id}
                                name={languageName}
                                levelLabel={languageLevelName}
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