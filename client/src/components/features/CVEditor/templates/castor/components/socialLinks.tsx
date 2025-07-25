import React from "react";
import { useCvEditStore } from "../../../../../../Store";
import { CVPreviewContent } from "../../../../../../config/content";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    container: {
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
        textDecoration: 'none',
        color: 'white'
    }
})

const SocialLinks: React.FC = () => {

    const { socialLinks: socialLinksContent } = CVPreviewContent.sections;
    const socialLinks = useCvEditStore((state) => state.socialLinks);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{socialLinksContent.title}</Text>
            <View style={styles.contentContainer}>
                {
                    socialLinks.length === 0 ? (
                        <View style={styles.LinkContainer}>
                            <Text style={styles.LinkTitle}>{socialLinksContent.default.platform}</Text>
                            <Link style={styles.LinkSrc} href={socialLinksContent.default.url}>{socialLinksContent.default.url}</Link>
                        </View>
                    ) : (
                        socialLinks.map((link, index) => {

                            const platformLabel = link.platform != '' ? link.platform + ':' : '';
                            const linkUrl = link.url != '' ? 'https://' + link.url : '';

                            return (
                                <View  style={styles.LinkContainer} key={index}>
                                    <Text style={styles.LinkTitle}>{platformLabel}</Text>
                                    <Link style={styles.LinkSrc} href={linkUrl}>{link.url}</Link>
                                </View>
                            )
                        })
                    )
                }
            </View>
        </View>
    );
}

export default SocialLinks;