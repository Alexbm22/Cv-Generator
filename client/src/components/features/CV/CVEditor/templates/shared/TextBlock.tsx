import React from "react";
import { StyleSheet, Text } from "@react-pdf/renderer";

interface TextBlockProps {
    text: string;
    fontSize?: number;
    color?: string;
}

const styles = StyleSheet.create({
    text: {
        fontSize: 10,
        color: '#424242',
        lineHeight: 1.5,
    },
});

const TextBlock: React.FC<TextBlockProps> = ({ text, fontSize, color }) => {
    return (
        <Text style={[styles.text, fontSize ? { fontSize } : {}, color ? { color } : {}]}>
            {text}
        </Text>
    );
};

export default TextBlock;
