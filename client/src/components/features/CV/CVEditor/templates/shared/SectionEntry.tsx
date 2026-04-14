import React from "react";
import { StyleSheet, Text, View, Link } from "@react-pdf/renderer";
import { formatDateRange } from "./dateUtils";
import { parseQuillToReactPDF } from "../../../../../../utils/parseHtmlToPdf";

interface SectionEntryProps {
    title: string;
    subtitle?: string;
    startDate: Date;
    endDate: Date;
    description: string;
    link?: string;
}

// Helvetica Bold at fontSize 11.5pt has an average character width of ~6.2pt.
// The right column is 65% of A4 (595pt) minus 50pt padding = ~337pt.
// If the display title exceeds 100% of container width, break subtitle to a new line.
const AVG_CHAR_WIDTH_PT = 6.2;
const TITLE_CONTAINER_WIDTH_PT = 337;

const styles = StyleSheet.create({
    container: {
        marginBottom: 5,
    },
    title: {
        lineHeight: 1.4,
        fontSize: 11.5,
        fontWeight: 'bold',
        color: '#424242',
    },
    dateRange: {
        fontSize: 9.5,
        color: '#757575',
        marginTop: 3,
        marginBottom: 3,
    },
    link: {
        fontSize: 8.5,
        color: '#1565C0',
        marginBottom: 4,
        marginTop: -2,
    },
    descriptionContainer: {
        marginTop: 2,
        fontSize: 10,
    },
});

const SectionEntry: React.FC<SectionEntryProps> = ({
    title,
    subtitle,
    startDate,
    endDate,
    description,
    link,
}) => {
    const displayTitle = subtitle ? `${title}, ${subtitle}` : title;
    const shouldBreak = subtitle
        ? displayTitle.length * AVG_CHAR_WIDTH_PT > TITLE_CONTAINER_WIDTH_PT
        : false;
    const dateRange = formatDateRange(startDate, endDate);
    const parsedDescription = description ? parseQuillToReactPDF(description, styles.descriptionContainer.fontSize as number) : null;

    return (
        <View style={styles.container}>
            {shouldBreak ? (
                <>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.title}>{subtitle}</Text>
                </>
            ) : (
                <Text style={styles.title}>{displayTitle}</Text>
            )}
            {dateRange !== '' && <Text style={styles.dateRange}>{dateRange}</Text>}
            {link && (
                <Link src={link} style={styles.link}>
                    {link}
                </Link>
            )}
            {parsedDescription && (
                <View style={styles.descriptionContainer}>
                    {parsedDescription}
                </View>
            )}
        </View>
    );
};

export default SectionEntry;
