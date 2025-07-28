import React from "react";
import { CVPreviewContent } from "../../../../../../config/content";
import * as Icons from '../../../../pdf/Icons'
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface GeneralInfosProps {
    phoneNumber: string,
    email: string,
    address: string,
    birthDate: Date
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        gap: 7,
        width: '100%'
    },
    row: {
        flexDirection: 'row',
        gap: 7,
        alignContent: 'center'
    },
    rowData: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    rowIcon: {
        marginTop: 1.5,
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
        <View style={styles.container}>
            <View style={styles.row}>
                <Icons.Phone size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>
                <Text style={styles.rowData}>{phoneNumVal}</Text>
            </View>
            <View style={styles.row}>
                <Icons.Email  size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>
                <Text style={styles.rowData}>{emailVal}</Text>
            </View>
            <View style={styles.row}>
                <Icons.Adress  size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>
                <Text style={styles.rowData}>{adressVal}</Text>
            </View>
            <View style={styles.row}>
                <Icons.Date  size={styles.rowIcon.size} color={styles.rowIcon.color} style={styles.rowIcon}/>
                <Text style={styles.rowData}>{birthDateVal}</Text>
            </View>
        </View>
    );
}

export default GeneralInfos;