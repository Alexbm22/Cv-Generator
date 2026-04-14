import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";
import SectionHeader from "./SectionHeader";

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
});

const Section: React.FC<SectionProps> = ({ title, children }) => {
    return (
        <View style={styles.container}>
            <SectionHeader title={title} />
            {children}
        </View>
    );
};

export default Section;
