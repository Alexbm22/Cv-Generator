import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../../constants/CV/CVEditor";

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

const { personal_infos: personalInfosConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const GeneralInfos: React.FC<GeneralInfosProps> = ({
    phoneNumber,
    email,
    address,
    birthDate,
}) => {
    const phoneNumVal = phoneNumber !== '' ? phoneNumber : personalInfosConstants.default.phone_number;
    const emailVal = email !== '' ? email : personalInfosConstants.default.email;
    const addressVal = address !== '' ? address : personalInfosConstants.default.address;

    return (
        <View style={styles.container}>
            <Text style={styles.infoText}>Home: {addressVal}</Text>
            <Text style={styles.infoText}>Phone: {phoneNumVal}</Text>
            <Text style={styles.infoText}>Email: {emailVal}</Text>
        </View>
    );
};

export default GeneralInfos;
