import React from 'react';
import { useCvEditStore } from '../../../../../Store';
import { Language, ProficiencyLanguageLevel } from '../../../../../interfaces/cv';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../../UI';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { LanguageLevelsMap } from '../../../../../constants/CV/languageLevelsMap';
import AddSectionButton from '../../../../UI/AddSectionButton';

interface ComponentProps {
    language: Language
}

const { languages: languagesConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = languagesConstants;

const LanguageComponent: React.FC<ComponentProps> = ({ language }) => {
    const updateLanguage = useCvEditStore((state) => state.updateLanguage);

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`language-${language.id}`}
                    label={fieldsConstants.language.label}
                    placeholder={fieldsConstants.language.placeholder}
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

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">{languagesConstants.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{languagesConstants.description}</p>
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
                <AddSectionButton onClick={() => addLanguage()} sectionName={'Language'} />
            </div>
        </div>
    )
}

export default LanguageMain;