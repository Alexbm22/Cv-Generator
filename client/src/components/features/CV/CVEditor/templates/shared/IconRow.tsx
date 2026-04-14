import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface IconRowProps {
    icon: React.ReactElement;
    text: string;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 7,
        alignContent: 'center'
    },
    text: {
        fontSize: 12,
    }
})

const IconRow: React.FC<IconRowProps> = ({ icon, text }) => {
    return (
        <View style={styles.row}>
            {icon}
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

export default IconRow;
