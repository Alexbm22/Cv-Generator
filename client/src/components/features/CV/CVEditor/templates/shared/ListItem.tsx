import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface ListItemProps {
    children: string;
    bulletChar?: string;
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    bullet: {
        fontSize: 10,
        color: '#424242',
        marginRight: 6,
    },
    text: {
        fontSize: 10,
        color: '#424242',
        lineHeight: 1.5,
        flex: 1,
    },
});

const ListItem: React.FC<ListItemProps> = ({ children, bulletChar = '•' }) => {
    return (
        <View style={styles.row}>
            <Text style={styles.bullet}>{bulletChar}</Text>
            <Text style={styles.text}>{children}</Text>
        </View>
    );
};

export default ListItem;
