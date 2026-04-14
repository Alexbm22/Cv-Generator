import React from "react";
import { StyleSheet, View } from "@react-pdf/renderer";

interface ListProps {
    children: React.ReactNode;
}

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
    },
});

const List: React.FC<ListProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            {children}
        </View>
    );
};

export default List;
