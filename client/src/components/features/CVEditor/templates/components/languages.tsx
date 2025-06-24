import React from "react";
import { useCvEditStore } from "../../../../../Store";
import { CVPreviewContent } from "../../../../../config/content";
import { ProficiencyLanguageLevel } from "../../../../../interfaces/cv_interface";
import { LanguageLevelsMap } from "../../../../../config/proficiency";

interface LanguagesProps {
    componentClassName: string;
    titleClassName: string;
    LanguageNameClassName: string;
    LanguageLevelClassName: string;
    LanguageLevelBarClassName: string;
    LanguageLevelBarBackgroundClassName: string;
}

const Languages: React.FC<LanguagesProps> = ({
    componentClassName,
    titleClassName,
    LanguageNameClassName,
    LanguageLevelClassName,
    LanguageLevelBarClassName,
    LanguageLevelBarBackgroundClassName,
}) => {

    const { languages: languagesContent } = CVPreviewContent.sections;
    const languages = useCvEditStore((state) => state.languages);

    return (
        <>
            <div className={componentClassName}>
                <h1 className={titleClassName}>{languagesContent.title}</h1>
                {
                    languages.map((language, index) => {
                        const LanguageLevel = language.level as ProficiencyLanguageLevel;
                        if (!LanguageLevel) return null; // verify if languagelevel is defined

                        const languageName = language.name != '' ? language.name + ':' : '';
                        const languageLevelName = LanguageLevel || LanguageLevelsMap[LanguageLevel];
                        const levelBarWidth = `${((LanguageLevelsMap[LanguageLevel].index + 1) / Object.keys(LanguageLevelsMap).length) * 100}%`;

                        return (
                            <div key={index} className="flex flex-col mt-2 items-start w-full" >
                                <div className="flex flex-row gap-2 w-full mb-2">
                                    <h1 className={LanguageNameClassName}>{languageName}</h1>
                                    <h1 className={LanguageLevelClassName}>{languageLevelName.slice(0,2)}</h1>
                                </div>

                                <div className={LanguageLevelBarBackgroundClassName}>
                                    <div 
                                        className={LanguageLevelBarClassName} 
                                        style={{ width: levelBarWidth }}>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
};

export default Languages;