import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import cvI18n from "../../../../../../../i18n/cvi18n";

interface GeneralInfosProps {
    phoneNumber: string;
    email: string;
    address: string;
    birthDate: Date;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 3,
    },
    infoText: {
        fontSize: 10,
        color: '#333333',
    },
});

const GeneralInfos: React.FC<GeneralInfosProps> = ({
    phoneNumber,
    email,
    address,
    birthDate,
}) => {
    const defaultPersonalInfos = JSON.parse(cvI18n.t('sections.personalInfos.default'));
    const phoneNumVal = phoneNumber !== '' ? phoneNumber : defaultPersonalInfos.phone_number;
    const emailVal = email !== '' ? email : defaultPersonalInfos.email;
    const addressVal = address !== '' ? address : defaultPersonalInfos.address;

    return (
        <View style={styles.container}>
            <Text style={styles.infoText}>{cvI18n.t('sections.personalInfos.home')}: {addressVal}</Text>
            <Text style={styles.infoText}>{cvI18n.t('sections.personalInfos.phone')}: {phoneNumVal}</Text>
            <Text style={styles.infoText}>{cvI18n.t('sections.personalInfos.email')}: {emailVal}</Text>
        </View>
    );
};

export default GeneralInfos;
