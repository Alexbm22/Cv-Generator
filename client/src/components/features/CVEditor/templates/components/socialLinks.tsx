import React from "react";
import { useCvEditStore } from "../../../../../Store";
import { CVPreviewContent } from "../../../../../config/content";

interface SocialLinksProps {
    componentClassName: string;
    titleClassName: string;
    linkPlatformClassName: string;
    linkUrlClassName: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({
    componentClassName,
    titleClassName,
    linkPlatformClassName,
    linkUrlClassName,
}) => {

    const { socialLinks: socialLinksContent } = CVPreviewContent.sections;
    const socialLinks = useCvEditStore((state) => state.socialLinks);

    return (
        <>
            <div className={componentClassName}>
                <h1 className={titleClassName}>{socialLinksContent.title}</h1>
                {
                    socialLinks.length === 0 ? (
                        <div className="flex flex-col mt-2 items-start w-full" >
                            <h1 className={linkPlatformClassName}>{socialLinksContent.default.platform}</h1>
                            <a href={socialLinksContent.default.url} target="_blank" className={linkUrlClassName}>{socialLinksContent.default.url}</a>
                        </div>
                    ) : (
                        socialLinks.map((link, index) => {

                            const platformLabel = link.platform != '' ? link.platform + ':' : '';
                            const linkUrl = link.url != '' ? 'https://' + link.url : '';

                            return (
                                <div key={index} className="flex flex-col mt-2 items-start w-full" >
                                    <h1 className={linkPlatformClassName}>{platformLabel}</h1>
                                    <a href={linkUrl} target="_blank" className={linkUrlClassName}>{link.url}</a>
                                </div>
                            )
                        })
                    )
                }
            </div>
        </>
    );
};

export default SocialLinks;