import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface SectionHeaderProps {
    title: string;
}

const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#424242',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    divider: {
        height: 1.5,
        backgroundColor: '#424242',
        width: '100%',
        marginBottom: 10,
    },
});

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
    return (
        <>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.divider} />
        </>
    );
};

export default SectionHeader;
