import React from "react";
import { useCvStore } from "../../../../Store";
import TextInputField from "../../../UI/textInputField";
import { CVEditContent } from "../../../../config/content";
import { SocialLink } from "../../../../interfaces/cv_interface";

const PersonalInfos: React.FC = () => {
    const {
        photo, firstName, lastName, email, phoneNumber, address, birthDate, 
        socialLinks, setPhoto, setFirstName, setLastName, setEmail, 
        setPhoneNumber, setAddress, setBirthDate, addSocialLink,
    } = useCvStore();

    const { personalInfos } = CVEditContent.formSections;
    const { fields } = personalInfos;
    
    return (
        <>
            <div className="font-sans w-auto">
                <h2 className="text-xl text-gray-600 font-bold mb-2">{personalInfos.title}</h2>
                <div className="flex flex-col gap-x-8 gap-y-4 s:grid grid-cols-2">
        
                    <div className="flex flex-col gap-x-8 gap-y-3">
                        <TextInputField
                            id="firstName"
                            label={personalInfos.fields.firstName.label}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={fields.firstName.placeholder}
                        />

                        <TextInputField
                            id="lastName"
                            label={fields.lastName.label}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={fields.lastName.placeholder}
                        />
                    </div>

                    <div className="flex flex-row gap-x-4 justify-start items-end">
                        <img className="max-w-50 max-h-20 object-contain rounded-lg border-gray-300 shadow-sm" src={photo ? photo : "/Images/anonymous_Picture.png"} alt="Image" />
                        <div>
                            <input 
                                id="photo" 
                                className="hidden" 
                                type={fields.photo.type} 
                                accept="image/*" 
                                onChange={setPhoto} 
                            />

                            <label htmlFor="photo" className="font-medium text-md text-blue-600 w-fit cursor-pointer">+ Add Photo</label>
                        </div>
                    </div>

                    <TextInputField
                        id="email"
                        type={fields.email.type}
                        label={fields.email.label}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={fields.email.placeholder}
                    />

                    <TextInputField
                        id="phoneNumber"
                        type={fields.phoneNumber.type}
                        label={fields.phoneNumber.label}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={fields.phoneNumber.placeholder}
                    />

                    <TextInputField
                        id="address"
                        label={fields.address.label}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={fields.address.placeholder}
                    />

                    <TextInputField
                        type={fields.birthDate.type}
                        id="birthDate"
                        label={fields.birthDate.label}
                        value={new Date(birthDate).toISOString().slice(0, 10)}
                        onChange={(e) => setBirthDate(new Date(e.target.value))}
                        placeholder={fields.birthDate.placeholder}
                    />

                    <div className="col-span-2 flex flex-col space-y1 w-full mt-2">
                        <label className="text-lg text-gray-600 font-bold">{fields.socialLinks.title}</label>
                        <p className="text-sm text-gray-500 mb-4e">{fields.socialLinks.description}</p>
                        <div className="flex flex-col content-start gap-x-8 gap-y-4 mt-3">
                            {
                                socialLinks.map((link) => (
                                    <div key={link.id} className="border rounded-lg p-5 border-gray-300 shadow-sm flex flex-col gap-x-8 gap-y-3 font-sans s:grid grid-cols-2">
                                        <SocialLinkComponent socialLink={link} />
                                    </div>
                                ))
                            }
                            <button onClick={() => addSocialLink({ platform: '', url: '' })} className="font-medium text-md text-blue-600 w-fit cursor-pointer">
                                {fields.socialLinks.addText}
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

    const { removeSocialLink, updateSocialLink } = useCvStore();
    const { fields } = CVEditContent.formSections.personalInfos;

    return (
        <>
            <div className="flex items-center justify-between col-span-2">
                <span className="text-lg font-medium text-gray-700">{socialLink.platform == '' ? 'Untitled' : socialLink.platform }</span>
                <button onClick={() => removeSocialLink(socialLink.id)}><span className="text-red-500 hover:cursor-pointer">del</span></button>
            </div>

            <TextInputField
                id={`platform-${socialLink.id}`}
                label={fields.socialLinks.platform.label}
                placeholder={fields.socialLinks.platform.placeholder}
                value={socialLink.platform}
                onChange={(e) => updateSocialLink(socialLink.id, { platform: e.target.value })}
            />
            <TextInputField
                id={`url-${socialLink.id}`}
                label={fields.socialLinks.url.label}
                placeholder={fields.socialLinks.url.placeholder}
                value={socialLink.url}
                onChange={(e) => updateSocialLink(socialLink.id, { url: e.target.value })}
            />
        </>
    );
}

export default PersonalInfos;