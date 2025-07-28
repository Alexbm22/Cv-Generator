import React from "react";
import { CVPreviewContent } from "../../../../../../config/content";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SocialLink } from "../../../../../../interfaces/cv";

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        marginBottom: 50,
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

type SocialLinksProps = {
    socialLinks: SocialLink[]
}

const SocialLinks: React.FC<SocialLinksProps> = ({
    socialLinks
}) => {

    const { socialLinks: socialLinksContent } = CVPreviewContent.sections;

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
                        socialLinks.map((link) => {

                            const platformLabel = link.platform != '' ? link.platform + ':' : '';
                            const linkUrl = link.url != '' ? 'https://' + link.url : '';

                            return (
                                <View  style={styles.LinkContainer} key={link.id}>
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