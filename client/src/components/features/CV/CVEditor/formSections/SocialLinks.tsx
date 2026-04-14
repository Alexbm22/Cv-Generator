import React from 'react';
import { useCvEditStore } from '../../../../../Store';
import { SocialLink } from '../../../../../interfaces/cv';
import { CV_EDITOR_FORM_CONSTANTS } from '../../../../../constants/CV/CVEditor';
import { Trash2 } from 'lucide-react';
import InputField from '../../../../UI/InputField';

const { social_links: fieldsConstants } = CV_EDITOR_FORM_CONSTANTS.sections.personal_infos.fields;

interface ComponentProps {
    socialLink: SocialLink;
}

const SocialLinkComponent: React.FC<ComponentProps> = ({ socialLink }) => {

    const removeSocialLink = useCvEditStore((state) => state.removeSocialLink);
    const updateSocialLink = useCvEditStore((state) => state.updateSocialLink);

    return (
        <>
            <div className="flex items-center justify-between col-span-2">
                <span className="text-lg font-medium text-gray-700">{socialLink.platform == '' ? 'Untitled' : socialLink.platform }</span>
                <button onClick={() => removeSocialLink(socialLink.id)} className='cursor-pointer'><Trash2 className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" /></button>
            </div>

            <InputField
                id={`platform-${socialLink.id}`}
                label={fieldsConstants.fields.platform.label}
                placeholder={fieldsConstants.fields.platform.placeholder}
                value={socialLink.platform}
                onChange={(e) => updateSocialLink(socialLink.id, { platform: e.target.value })}
            />
            <InputField
                id={`url-${socialLink.id}`}
                label={fieldsConstants.fields.url.label}
                placeholder={fieldsConstants.fields.url.placeholder}
                value={socialLink.url}
                onChange={(e) => updateSocialLink(socialLink.id, { url: e.target.value })}
            />
        </>
    );
}
const SocialLinksMain:React.FC = () => {
    
    const socialLinks = useCvEditStore((state) => state.socialLinks);
    const addSocialLink = useCvEditStore((state) => state.addSocialLink);

    return (
        <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
            {
                socialLinks.map((link) => (
                    <div key={link.id} className="border rounded-lg p-5 border-gray-300 shadow-sm flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2">
                        <SocialLinkComponent socialLink={link} />
                    </div>
                ))
            }
        </div>
    )
}

export default SocialLinksMain;