import React from "react";
import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { SocialLink } from "../../../../../../interfaces/cv";
import { CV_EDITOR_TEMPLATE_CONSTANTS } from "../../../../../../constants/CV/CVEditor";

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

const { social_links: socialLinksConstants } = CV_EDITOR_TEMPLATE_CONSTANTS.sections;

const SocialLinks: React.FC<SocialLinksProps> = ({
    socialLinks
}) => {

    if(socialLinks.length === 0) {
        socialLinks = socialLinksConstants.default;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{socialLinksConstants.title}</Text>
            <View style={styles.contentContainer}>
                {
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
                }
            </View>
        </View>
    );
}

export default SocialLinks;