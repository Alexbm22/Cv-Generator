import React from "react";
import { useCvStore } from "../../../../../Store";
import { CVPreviewContent } from "../../../../../config/content";
import {
    PhoneIcon,
    AddressIcon,
    EmailIcon,
    CalendarIcon
} from '../../../../Icons'

interface GeneralInfosProps {
    componentClassName: string; 
    phoneNumberClassName: string;
    emailClassName: string;
    addressClassName: string; 
    birthDateClassName: string;
    phoneIconClassName: string; 
    emailIconClassName: string;
    addressIconClassName: string;
    birthDateIconClassName: string;
}

const GeneralInfos: React.FC<GeneralInfosProps> = ({
    componentClassName,
    phoneNumberClassName,
    emailClassName,
    addressClassName,
    birthDateClassName,
    phoneIconClassName,
    emailIconClassName,
    addressIconClassName,
    birthDateIconClassName,
}) => {

    const { phoneNumber, email, address, birthDate } = useCvStore();
    const { personalInfos } = CVPreviewContent.sections;

    const phoneNumVal = phoneNumber !== ''? phoneNumber : personalInfos.default.phoneNumber;
    const emailVal = email !== ''? email : personalInfos.default.email;
    const adressVal = address !== ''? address : personalInfos.default.address;

    const birthDateObj = new Date(birthDate); // conversion to Date

    const day = birthDateObj.getDate().toString().padStart(2, '0');
    const month = (birthDateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = birthDateObj.getFullYear();

    const birthDateVal = `${day}/${month}/${year}`;

    return (
        <div className={componentClassName}>
            <div className="flex flex-row items-center gap-x-2">
                <PhoneIcon className={phoneIconClassName}/>
                <span className={phoneNumberClassName}>{phoneNumVal}</span>
            </div>
            <div className="flex flex-row items-center gap-x-2">
                <EmailIcon className={emailIconClassName}/>
                <span className={emailClassName}>{emailVal}</span>
            </div>
            <div className="flex flex-row items-center gap-x-2">
                <AddressIcon className={addressIconClassName}/>
                <span className={addressClassName}>{adressVal}</span>
            </div>
            <div className="flex flex-row items-center gap-x-2">
                <CalendarIcon className={birthDateIconClassName} />
                <span className={birthDateClassName}>{birthDateVal}</span>
            </div>
        </div>
    );
}

export default GeneralInfos;