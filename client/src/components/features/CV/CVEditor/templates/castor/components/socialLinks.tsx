import React from "react";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SocialLink } from "../../../../../../../interfaces/cv";
import cvI18n from "../../../../../../../i18n/cvi18n";

const styles = StyleSheet.create({
    container: {
        marginBottom: 36,
        width: '100%',
        gap: 8,
    },
    title: {
        fontWeight: 1000, // to do: repair the fontweight error
        fontSize: 15
    },
    contentContainer: {
        gap: 10
    },
    LinkContainer: {
        
    },
    LinkTitle: {
        fontSize: 13
    },
    LinkSrc: {
        fontSize: 12,
        textDecoration: 'underline',
        color: 'white'
    }
})

type SocialLinksProps = {
    socialLinks: SocialLink[]
}

const SocialLinks: React.FC<SocialLinksProps> = ({
    socialLinks
}) => {

    if(socialLinks.length === 0) {
        socialLinks = JSON.parse(cvI18n.t('sections.socialLinks.default'));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{cvI18n.t('sections.socialLinks.title')}</Text>
            <View style={styles.contentContainer}>
                {
                    socialLinks.map((link, index) => {

                            const platformLabel = link.platform != '' ? link.platform + ':' : '';
                            const linkUrl = link.url != '' ? 'https://' + link.url : '';

                            return (
                                <View key={index} style={styles.LinkContainer}>
                                    <Text style={styles.LinkTitle}>{platformLabel}</Text>
                                    <Link style={styles.LinkSrc} href={linkUrl}>{link.url}</Link>
                                </View>
                            )
                        })
                }
            </View>
        </View>
    );
}

export default SocialLinks;