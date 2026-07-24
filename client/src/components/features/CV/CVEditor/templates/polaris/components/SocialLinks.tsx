import React from "react";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SocialLink } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";
import SectionHeader from "../../shared/SectionHeader";

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 2,
    },
    linkEntry: {
        flexDirection: 'row',
        gap: 3,
    },
    platformLabel: {
        fontSize: 10,
        color: '#333333',
        fontWeight: 'bold',
    },
    linkUrl: {
        fontSize: 10,
        color: '#333333',
        textDecoration: 'none',
    },
    separator: {
        fontSize: 10,
        color: '#aaaaaa',
    },
});

type SocialLinksProps = {
    socialLinks: SocialLink[];
};

const SocialLinks: React.FC<SocialLinksProps> = ({ socialLinks }) => {
    if (socialLinks.length === 0) {
        socialLinks = JSON.parse(cvI18n.t('sections.socialLinks.default'));
    }

    return (
        <View style={styles.container}>
            <SectionHeader title={cvI18n.t('sections.socialLinks.title')} />
            <View style={styles.itemsContainer}>
                {socialLinks.map((link, index) => {
                    const platformLabel = link.platform !== '' ? link.platform + ': ' : '';
                    const linkUrl = link.url !== '' ? 'https://' + link.url : '';

                    return (
                        <React.Fragment key={index}>
                            <View style={styles.linkEntry}>
                                {platformLabel !== '' && (
                                    <Text style={styles.platformLabel}>{platformLabel}</Text>
                                )}
                                <Link src={linkUrl} style={styles.linkUrl}>{link.url}</Link>
                            </View>
                            {index < socialLinks.length - 1 && (
                                <Text style={styles.separator}>|</Text>
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
};

export default SocialLinks;
