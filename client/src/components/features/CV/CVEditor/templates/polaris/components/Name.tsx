import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface NameProps {
    firstName: string;
    lastName: string;
    jobTitle: string;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    fullName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    jobTitle: {
        fontSize: 12,
        color: '#555555',
        marginTop: 4,
    },
});

const Name: React.FC<NameProps> = ({ firstName, lastName, jobTitle }) => {
    const hasName = firstName !== '' || lastName !== '';
    const firstNameVal = hasName ? firstName : 'John';
    const lastNameVal = hasName ? lastName : 'Doe';
    const jobTitleVal = jobTitle !== '' ? jobTitle : null;

    const fullName = `${firstNameVal} ${lastNameVal}`;

    return (
        <View style={styles.container}>
            <Text style={styles.fullName}>{fullName}</Text>
            {jobTitleVal && <Text style={styles.jobTitle}>{jobTitleVal}</Text>}
        </View>
    );
};

export default Name;
