import React from 'react';
import { useCvEditStore } from '../../../../../Store';
import Editor from '../../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../../UI/Collapsable';
import InputField from '../../../../UI/InputField';
import { sanitizeHtml } from '../../../../../utils';
import { CustomSectionAttributes } from '../../../../../interfaces/cv';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import AddSectionButton from '../../../../UI/AddSectionButton';

interface ComponentProps {
    customSection: CustomSectionAttributes
}


const { custom_section: custonSectionConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = custonSectionConstants

const CustomSectionComponent:React.FC<ComponentProps> = ({ customSection }) => {

    const updateCustomSectionAttributes = useCvEditStore((state) => state.updateCustomSectionAttributes);

    return (
        <div className='p-0.5' dir='ltr'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid mb-5 mt-4'>
                <InputField
                    id={`Title-${customSection.id}`}
                    label={fieldsConstants.title.label}
                    placeholder={fieldsConstants.title.placeholder}
                    value={customSection.title}
                    onChange={(e) => updateCustomSectionAttributes(customSection.id, { title: e.target.value })}
                />

                <div className='flex flex-col s:grid grid-cols-2 gap-x-8 gap-y-3'>
                    <InputField
                        type={fieldsConstants.start_date.type}
                        id={`startDate-${customSection.id}`}
                        label={fieldsConstants.start_date.label}
                        placeholder={fieldsConstants.start_date.placeholder}
                        value={new Date(customSection.startDate).toISOString().slice(0, 10)}
                        onChange={(e) => updateCustomSectionAttributes(customSection.id, { startDate: new Date(e.target.value) })}
                    />

                    <InputField
                        type={fieldsConstants.end_date.type}
                        id={`endDate-${customSection.id}`}
                        placeholder={fieldsConstants.end_date.placeholder}
                        label={fieldsConstants.end_date.label}
                        value={new Date(customSection.endDate).toISOString().slice(0, 10)}
                        onChange={(e) => updateCustomSectionAttributes(customSection.id, { endDate: new Date(e.target.value) })}
                    />
                </div>
            </div>

            <Editor
                htmlContent={customSection.description}
                onHtmlChange={(html) => updateCustomSectionAttributes(customSection.id, { description: sanitizeHtml(html) })}
                placeholder={fieldsConstants.description.placeholder}
            />
        </div>
    )
}

const CustomSectionMain:React.FC = () => {

    const customSections = useCvEditStore((state) => state.customSections);
    const addCustomSectionAttributes = useCvEditStore((state) => state.addCustomSectionAttributes);
    const removeCustomSectionAttributes = useCvEditStore((state) => state.removeCustomSectionAttributes);
    const setCustomSectionTitle = useCvEditStore((state) => state.setCustomSectionTitle);

    return (
        <div className="mt-5">
            <input 
                className="text-xl text-gray-600 placeholder-gray-600 font-bold focus:outline-none" 
                onChange={(e) => setCustomSectionTitle(e.target.value)}
                value={customSections.title}
                placeholder={custonSectionConstants.section_title_placeholder}
            />
            <p className="text-sm text-gray-500 mb-4">{custonSectionConstants.description}</p>
            <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                {
                    customSections && customSections.content.map((sec) => (
                        <div key={sec.id} >
                            <Collapsable
                                title={sec.title ? sec.title : "Untitled"}
                                children={<CustomSectionComponent customSection={sec} />}
                                onDelete={() => removeCustomSectionAttributes(sec.id)}
                            />
                        </div>
                    ))
                }
                <AddSectionButton onClick={() => addCustomSectionAttributes()} sectionName={'Custom Section'} />
            </div>
        </div>
    )
}

export default CustomSectionMain;