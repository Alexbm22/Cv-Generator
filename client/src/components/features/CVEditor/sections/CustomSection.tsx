import React from 'react';
import { useCvStore } from '../../../../Store';
import Editor from '../../../UI/TextEditor/EditorComponent'
import Collapsable from '../../../UI/Collapsable';
import TextInputField from '../../../UI/textInputField';
import { sanitizeHtml } from '../../../../utils';
import { CustomSectionAttributes } from '../../../../interfaces/cv_interface';

interface ComponentProps {
    customSection: CustomSectionAttributes
}

const CustomSectionComponent:React.FC<ComponentProps> = ({ customSection }) => {

    const { updateCustomSectionAttributes } = useCvStore();

    return (
        <div className='p-0.5'>
            <div className='flex flex-col gap-x-8 gap-y-3 font-sans md:grid mb-5 mt-4'>
                <TextInputField
                    id={`Title-${customSection.id}`}
                    label="Title:"
                    placeholder="e.g. My Custom Section Title"
                    value={customSection.title}
                    onChange={(e) => updateCustomSectionAttributes(customSection.id, { title: e.target.value })}
                />

                <div className='flex flex-col md:grid grid-cols-2 gap-x-8 gap-y-3'>
                    <TextInputField
                        type='date'
                        id={`startDate-${customSection.id}`}
                        label="Start Date:"
                        placeholder=''
                        value={new Date(customSection.startDate).toISOString().slice(0, 10)}
                        onChange={(e) => updateCustomSectionAttributes(customSection.id, { startDate: new Date(e.target.value) })}
                    />

                    <TextInputField
                        type='date'
                        id={`endDate-${customSection.id}`}
                        placeholder=''
                        label="End Date:"
                        value={new Date(customSection.endDate).toISOString().slice(0, 10)}
                        onChange={(e) => updateCustomSectionAttributes(customSection.id, { endDate: new Date(e.target.value) })}
                    />
                </div>
            </div>

            <Editor
                htmlContent={customSection.description}
                onHtmlChange={(html) => updateCustomSectionAttributes(customSection.id, { description: sanitizeHtml(html) })}
                placeholder="Write a brief description of your studies and any relevant projects or achievements."
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

    return (
        <div className="mt-5">
            <input 
                className="text-xl text-gray-600 placeholder-gray-600 font-bold focus:outline-none" 
                onChange={(e) => setCustomSectionTitle(e.target.value)}
                placeholder='Add a Title'
            />
            <p className="text-sm text-gray-500 mb-4">Indicate the exact title of the degree or training, specifying if obtained and the distinction (most recent only).</p>
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