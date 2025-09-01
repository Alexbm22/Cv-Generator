import React from "react";
import { useCvEditStore } from "../../../../../Store";
import TextInputField from "../../../../UI/textInputField";
import { SocialLink } from "../../../../../interfaces/cv";
import { CV_EDITOR_FORM_CONSTANTS } from "../../../../../constants/CV/CVEditor";
import PhotoEditor from "./PhotoEditor/photoEditor";

const { personal_infos: personalInfosConstants } = CV_EDITOR_FORM_CONSTANTS.sections;
const { fields: fieldsConstants } = personalInfosConstants;

const PersonalInfos: React.FC = () => {
    const title = useCvEditStore(state => state.title);
    const setTitle = useCvEditStore(state => state.setTitle);
    const jobTitle = useCvEditStore(state => state.jobTitle);
    const setJobTitle = useCvEditStore(state => state.setJobTitle);
    const firstName  = useCvEditStore((state) => state.firstName);
    const lastName  = useCvEditStore((state) => state.lastName);
    const email  = useCvEditStore((state) => state.email);
    const phoneNumber = useCvEditStore((state) => state.phoneNumber);
    const address  = useCvEditStore((state) => state.address);
    const birthDate  = useCvEditStore((state) => state.birthDate);
    const socialLinks = useCvEditStore((state) => state.socialLinks);
    const setFirstName = useCvEditStore((state) => state.setFirstName);
    const setLastName = useCvEditStore((state) => state.setLastName);
    const setEmail = useCvEditStore((state) => state.setEmail);
    const setPhoneNumber = useCvEditStore((state) => state.setPhoneNumber);
    const setAddress = useCvEditStore((state) => state.setAddress);
    const setBirthDate = useCvEditStore((state) => state.setBirthDate);
    const addSocialLink = useCvEditStore((state) => state.addSocialLink);
    
    return (
        <>
            <div className="font-sans w-auto">
                <h2 className="text-xl text-gray-600 font-bold mb-2">{personalInfosConstants.title}</h2>
                <div className="flex flex-col gap-x-8 gap-y-4 s:grid grid-cols-2">

                    <TextInputField
                        id={personalInfosConstants.fields.title.label}
                        label={personalInfosConstants.fields.title.label}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={fieldsConstants.title.placeholder}
                    />

                    <TextInputField
                        id={fieldsConstants.job_title.label}
                        label={fieldsConstants.job_title.label}
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder={fieldsConstants.job_title.placeholder}
                    />
        
                    <div className="flex flex-col gap-x-8 gap-y-3">
                        <TextInputField
                            id={personalInfosConstants.fields.first_name.label}
                            label={personalInfosConstants.fields.first_name.label}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={fieldsConstants.first_name.placeholder}
                        />

                        <TextInputField
                            id={fieldsConstants.last_name.label}
                            label={fieldsConstants.last_name.label}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={fieldsConstants.last_name.placeholder}
                        />
                    </div>

                    <PhotoEditor />

                    <TextInputField
                        id={fieldsConstants.email.label}
                        type={fieldsConstants.email.type}
                        label={fieldsConstants.email.label}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={fieldsConstants.email.placeholder}
                    />

                    <TextInputField
                        id={fieldsConstants.phone_number.label}
                        type={fieldsConstants.phone_number.type}
                        label={fieldsConstants.phone_number.label}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={fieldsConstants.phone_number.placeholder}
                    />

                    <TextInputField
                        id="address"
                        label={fieldsConstants.address.label}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={fieldsConstants.address.placeholder}
                    />

                    <TextInputField
                        type={fieldsConstants.birth_date.type}
                        id={fieldsConstants.birth_date.label}
                        label={fieldsConstants.birth_date.label}
                        value={new Date(birthDate).toISOString().slice(0, 10)}
                        onChange={(e) => setBirthDate(new Date(e.target.value))}
                        placeholder={fieldsConstants.birth_date.placeholder}
                    />

                    <div className="col-span-2 flex flex-col space-y1 w-full mt-2">
                        <label className="text-lg text-gray-600 font-bold">{fieldsConstants.social_links.title}</label>
                        <p className="text-sm text-gray-500 mb-4e">{fieldsConstants.social_links.description}</p>
                        <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                            {
                                socialLinks.map((link) => (
                                    <div key={link.id} className="border rounded-lg p-5 border-gray-300 shadow-sm flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2">
                                        <SocialLinkComponent socialLink={link} />
                                    </div>
                                ))
                            }
                            <button onClick={() => addSocialLink()} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                                {fieldsConstants.social_links.add_button_text}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 

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
                <button onClick={() => removeSocialLink(socialLink.id)}><span className="text-red-500 hover:cursor-pointer">del</span></button>
            </div>

            <TextInputField
                id={`platform-${socialLink.id}`}
                label={fieldsConstants.social_links.fields.platform.label}
                placeholder={fieldsConstants.social_links.fields.platform.placeholder}
                value={socialLink.platform}
                onChange={(e) => updateSocialLink(socialLink.id, { platform: e.target.value })}
            />
            <TextInputField
                id={`url-${socialLink.id}`}
                label={fieldsConstants.social_links.fields.url.label}
                placeholder={fieldsConstants.social_links.fields.url.placeholder}
                value={socialLink.url}
                onChange={(e) => updateSocialLink(socialLink.id, { url: e.target.value })}
            />
        </>
    );
}

export default PersonalInfos;