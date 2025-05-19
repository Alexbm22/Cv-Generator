import { useCvStore } from '../../../../Store';
import { Language, ProficiencyLanguageLevel } from '../../../../interfaces/cv_interface';
import {
    Collapsable,
    TextInputField,
    SliderPicker
} from '../../../UI';
import React from 'react';

interface ComponentProps {
    language: Language
}

const LanguageComponent: React.FC<ComponentProps> = ({ language }) => {
    const { updateLanguage } = useCvStore();

    const LanguageLevelsMap = {
        [ProficiencyLanguageLevel.A1]: { index: 0, color: '#da4500', displayedVal: 'A1'},
        [ProficiencyLanguageLevel.A2]:  { index: 1, color: '#ffac33', displayedVal: 'A2'},
        [ProficiencyLanguageLevel.B1]:  { index: 2, color: '#ffd413', displayedVal: 'B1'},
        [ProficiencyLanguageLevel.B2]:  { index: 3, color: '#7ad96d', displayedVal: 'B2'},
        [ProficiencyLanguageLevel.C1]:  { index: 4, color: '#5cd41c', displayedVal: 'C1'},
        [ProficiencyLanguageLevel.C2]:  { index: 5, color: '#41bc00', displayedVal: 'C2'}
    }

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans md:grid grid-cols-2 mb-5 mt-4'>
                <TextInputField
                    id={`language-${language.id}`}
                    label="Language:"
                    placeholder="e.g. English"
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
    const { languages, addLanguage, removeLanguage } = useCvStore();

    return (
        <div className="mt-5">
            <h2 className="text-xl text-gray-600 font-bold">Languages</h2>
            <p className="text-sm text-gray-500 mb-4">Your know-how (technical) and interpersonal skills</p>
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
                    + Add Language
                </button>
            </div>
        </div>
    )
}

export default LanguageMain;