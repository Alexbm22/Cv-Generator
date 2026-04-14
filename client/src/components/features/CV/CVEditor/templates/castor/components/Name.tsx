import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface NameProps {
    firstName: string;
    lastName: string;
    jobTitle: string;
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    fullName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 8,
    },
    fullNameFirst: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 2,
    },
    jobTitle: {
        fontSize: 13,
        color: '#616161',
    },
})

// Helvetica Bold at fontSize 26pt has an average character width of ~14pt.
// The name container is approximately 50% of A4 page width (~297pt).
// If the full name exceeds 60% of that width (~178pt / ~12 chars), break to two lines.
const AVG_CHAR_WIDTH_PT = 14;
const NAME_CONTAINER_WIDTH_PT = 400;
const OVERFLOW_THRESHOLD = NAME_CONTAINER_WIDTH_PT * 0.6;

const Name: React.FC<NameProps> = ({ firstName, lastName, jobTitle }) => {
    const firstNameVal = firstName !== '' ? firstName : 'John';
    const lastNameVal = lastName !== '' ? lastName : 'Doe';
    const jobTitleVal = jobTitle !== '' ? jobTitle : null;

    const fullName = `${firstNameVal} ${lastNameVal}`;
    const shouldBreak = fullName.length * AVG_CHAR_WIDTH_PT > OVERFLOW_THRESHOLD;

    return (
        <View style={styles.container}>
            {shouldBreak ? (
                <>
                    <Text style={styles.fullNameFirst}>{firstNameVal}</Text>
                    <Text style={styles.fullName}>{lastNameVal}</Text>
                </>
            ) : (
                <Text style={styles.fullName}>{fullName}</Text>
            )}
            {jobTitleVal && <Text style={styles.jobTitle}>{jobTitleVal}</Text>}
        </View>
    );
}

export default Name;
