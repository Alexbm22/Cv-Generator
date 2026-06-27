import React from "react";
import * as Icons from '../../../../../pdf/Icons'
import { StyleSheet, View } from "@react-pdf/renderer";
import cvI18n from "../../../../../../../i18n/cvi18n";
import IconRow from "../../shared/IconRow";

interface GeneralInfosProps {
    phoneNumber: string,
    email: string,
    address: string,
    birthDate: Date
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 36,
        gap: 7,
        width: '100%',
        fontWeight: 'light',
    },
    rowIcon: {
        marginBottom: 1.5,
        size: 12,
        color: 'white'
    }
})

const GeneralInfos: React.FC<GeneralInfosProps> = ({
    phoneNumber,
    email,
    address,
    birthDate,
}) => {

    const defaultPersonalInfos = JSON.parse(cvI18n.t('sections.personalInfos.default'));

    const phoneNumVal = phoneNumber !== ''? phoneNumber : defaultPersonalInfos.phone_number;
    const emailVal = email !== ''? email : defaultPersonalInfos.email;
    const adressVal = address !== ''? address : defaultPersonalInfos.address;

    const birthDateObj = new Date(birthDate); // conversion to Date

    const day = birthDateObj.getDate().toString().padStart(2, '0');
    const month = (birthDateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = birthDateObj.getFullYear();

    const birthDateVal = `${day}/${month}/${year}`;

    return (
        <View style={styles.container}>
            <IconRow icon={<Icons.Phone size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>} text={phoneNumVal} />
            <IconRow icon={<Icons.Email size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>} text={emailVal} />
            <IconRow icon={<Icons.Adress size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>} text={adressVal} />
            <IconRow icon={<Icons.Date size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>} text={birthDateVal} />
        </View>
    );
}

export default GeneralInfos;