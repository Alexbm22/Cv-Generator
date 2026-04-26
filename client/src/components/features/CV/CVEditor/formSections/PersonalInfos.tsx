import React, { useState } from "react";
import { useCvEditStore } from "../../../../../Store";
import InputField from "../../../../UI/InputField";
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
    const lastName = useCvEditStore((state) => state.lastName);
    const email = useCvEditStore((state) => state.email);
    const phoneNumber = useCvEditStore((state) => state.phoneNumber);
    const address = useCvEditStore((state) => state.address);
    const birthDate = useCvEditStore((state) => state.birthDate);
    const setFirstName = useCvEditStore((state) => state.setFirstName);
    const setLastName = useCvEditStore((state) => state.setLastName);
    const setEmail = useCvEditStore((state) => state.setEmail);
    const setPhoneNumber = useCvEditStore((state) => state.setPhoneNumber);
    const setAddress = useCvEditStore((state) => state.setAddress);
    const setBirthDate = useCvEditStore((state) => state.setBirthDate);

    
    const [ isSelectingPhoto, setIsSelectingPhoto ] = useState<boolean>(false); // used to manage form fileds positioning
    
    return (
        <>
            <div className="bg-white rounded-2xl border border-[#d2d2d7]/50 shadow-[0_2px_12px_rgba(0,0,0,0.07)] px-6 py-5 w-full mb-0">
                <h2 className="text-[17px] text-[#1d1d1f] font-semibold tracking-[-0.01em] mb-3">{personalInfosConstants.title}</h2>
                <div className="flex flex-col gap-x-8 gap-y-4 s:grid grid-cols-2">

                    <InputField
                        id={personalInfosConstants.fields.title.label}
                        label={personalInfosConstants.fields.title.label}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={fieldsConstants.title.placeholder}
                    />

                    <InputField
                        id={fieldsConstants.job_title.label}
                        label={fieldsConstants.job_title.label}
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder={fieldsConstants.job_title.placeholder}
                    />
                    
                    <InputField
                        id={personalInfosConstants.fields.first_name.label}
                        label={personalInfosConstants.fields.first_name.label}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={fieldsConstants.first_name.placeholder}
                    />

                    <InputField
                        id={fieldsConstants.last_name.label}
                        label={fieldsConstants.last_name.label}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={fieldsConstants.last_name.placeholder}
                    />

                    
                    <InputField
                        id={fieldsConstants.email.label}
                        type={fieldsConstants.email.type}
                        label={fieldsConstants.email.label}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={fieldsConstants.email.placeholder}
                    />

                    <InputField
                        id={fieldsConstants.phone_number.label}
                        type={fieldsConstants.phone_number.type}
                        label={fieldsConstants.phone_number.label}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={fieldsConstants.phone_number.placeholder}
                    />

                    <div className="flex flex-col h-fit gap-x-8 gap-y-4 s:grid grid-cols-1">
                        <InputField
                            id="address"
                            label={fieldsConstants.address.label}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={fieldsConstants.address.placeholder}
                        />

                        <InputField
                            type={fieldsConstants.birth_date.type}
                            id={fieldsConstants.birth_date.label}
                            label={fieldsConstants.birth_date.label}
                            value={birthDate && !isNaN(new Date(birthDate).getTime()) ? new Date(birthDate).toISOString().slice(0, 10) : ""}
                            onChange={(e) => setBirthDate(new Date(e.target.value))}
                            placeholder={fieldsConstants.birth_date.placeholder}
                        />
                    </div>

                    <PhotoEditor isSelectingPhoto={isSelectingPhoto} setIsSelectingPhoto={setIsSelectingPhoto} />
                </div>
            </div>
        </>
    );
}

export default PersonalInfos;