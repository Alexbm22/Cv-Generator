import React from 'react';
import { useCvStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { CustomSectionAttributes } from '../../../../interfaces/cv_interface';
import { CVEditContent } from '../../../../config/content';

interface ComponentProps {
    customSection: CustomSectionAttributes
}

const CustomSectionComponent:React.FC<ComponentProps> = ({ customSection }) => {

    const { updateCustomSectionAttributes } = useCvStore();
    const { fields } = CVEditContent.formSections.customSection;

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans s:grid mb-5 mt-4'>
                <TextInputField
                    id={`Title-${customSection.id}`}
                    label={fields.title.label}
                    placeholder={fields.title.placeholder}
                    value={customSection.title}
                    onChange={(e) => updateCustomSectionAttributes(customSection.id, { title: e.target.value })}
                />

                <div className='flex flex-col s:grid grid-cols-2 gap-x-8 gap-y-3'>
                    <TextInputField
                        type={fields.startDate.type}
                        id={`startDate-${customSection.id}`}
                        label={fields.startDate.label}
                        placeholder={fields.startDate.placeholder}
                        value={new Date(customSection.startDate).toISOString().slice(0, 10)}
                        onChange={(e) => updateCustomSectionAttributes(customSection.id, { startDate: new Date(e.target.value) })}
                    />

                    <TextInputField
                        type={fields.endDate.type}
                        id={`endDate-${customSection.id}`}
                        placeholder={fields.endDate.placeholder}
                        label={fields.endDate.label}
                        value={new Date(customSection.endDate).toISOString().slice(0, 10)}
                        onChange={(e) => updateCustomSectionAttributes(customSection.id, { endDate: new Date(e.target.value) })}
                    />
                </div>
            </div>

            <Editor
                htmlContent={customSection.description}
                onHtmlChange={(html) => updateCustomSectionAttributes(customSection.id, { description: sanitizeHtml(html) })}
                placeholder={fields.description.placeholder}
            />
        </div>
    )
}

const CustomSectionMain:React.FC = () => {

    const { 
        customSections,
        addCustomSectionAttributes,
        removeCustomSectionAttributes,
        setCustomSectionTitle 
    } = useCvStore();
    const { customSection } = CVEditContent.formSections;

    return (
        <div className="mt-5">
            <input 
                className="text-xl text-gray-600 placeholder-gray-600 font-bold focus:outline-none" 
                onChange={(e) => setCustomSectionTitle(e.target.value)}
                placeholder={customSection.sectionTitlePlaceholder}
            />
            <p className="text-sm text-gray-500 mb-4">{customSection.description}</p>
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
                <button onClick={() => addCustomSectionAttributes({})} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                    + Add {customSections.title ? customSections.title : "Custom Section"}
                </button>
            </div>
        </div>
    )
}

export default CustomSectionMain;