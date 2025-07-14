import React from 'react';
import { useCvEditStore } from '../../../../Store';
import { Language, ProficiencyLanguageLevel } from '../../../../interfaces/cv';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../UI';
import { LanguageLevelsMap } from '../../../../config/proficiency';
import { CVEditContent } from '../../../../config/content';

interface ComponentProps {
    language: Language
}

const LanguageComponent: React.FC<ComponentProps> = ({ language }) => {
    const updateLanguage = useCvEditStore((state) => state.updateLanguage);
    const { fields } = CVEditContent.formSections.languages;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`language-${language.id}`}
                    label={fields.language.label}
                    placeholder={fields.language.placeholder}
                    value={language.name}
                    onChange={(e) => updateLanguage(language.id, { name: e.target.value })}
                />

                <SliderPicker
                    LevelsMap={LanguageLevelsMap}
                    selectedLevel={language.level}
                    sectionId={language.id}
                    onLevelChange={(id: string, level: ProficiencyLanguageLevel) => updateLanguage(id, { level })}
                />

            </div>
        </div>
    )
}

const LanguageMain:React.FC = () => {

    
    const languages = useCvEditStore((state) => state.languages);
    const addLanguage = useCvEditStore((state) => state.addLanguage);
    const removeLanguage = useCvEditStore((state) => state.removeLanguage);

    const { languages: languagesContent } = CVEditContent.formSections;

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{languagesContent.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{languagesContent.description}</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                {
                    languages.map((language) => (
                        <div key={language.id} >
                            <Collapsable 
                                title={language.name ? language.name : "Untitled"} 
                                children={<LanguageComponent language={language}/>} 
                                onDelete={() => removeLanguage(language.id)}
                            />
                        </div>
                    ))
                }
                <button onClick={() => addLanguage({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    {languagesContent.addText}
                </button>
            </div>
        </div>
    )
}

export default LanguageMain;