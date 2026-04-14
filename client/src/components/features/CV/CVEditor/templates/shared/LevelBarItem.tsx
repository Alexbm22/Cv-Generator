import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

interface LevelBarItemProps {
    name: string;
    levelLabel: string;
    levelBarWidth: string;
}

const styles = StyleSheet.create({
    container: {
        gap: 7
    },
    topRow: {
        flexDirection: 'row',
        gap: 10
    },
    name: {
        fontSize: 12
    },
    level: {
        fontSize: 12,
        color: 'white'
    },
    barContainer: {
        width: '100%',
        height: 3,
        position: 'relative' as const
    },
    barBackground: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        opacity: 0.3,
        position: 'absolute' as const
    },
    barForeground: {
        backgroundColor: 'white',
        height: '100%',
        position: 'absolute' as const
    }
})

const LevelBarItem: React.FC<LevelBarItemProps> = ({ name, levelLabel, levelBarWidth }) => {
    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.level}>{levelLabel}</Text>
            </View>
            <View style={styles.barContainer}>
                <View style={styles.barBackground} />
                <View style={[styles.barForeground, { width: levelBarWidth }]} />
            </View>
        </View>
    );
}

export default LevelBarItem;
