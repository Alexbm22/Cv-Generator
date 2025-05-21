import React from "react";
import { 
    CVPhoto, 
    AboutMe,
    Skills,
    SocialLinks,
    GeneralInfos
} from "../components";

const CastorTemplate: React.FC = () => {

    return (
        <div className="flex flex-row bg-white w-[calc(100vw*0.4)] h-[calc(100vw*0.6)] max-w-[620px] max-h-[877px] shadow-lg">
            <div className="flex flex-col h-full w-38/100 bg-gray-600 p-7 items-center leading-relaxed">
                <CVPhoto className="rounded-full w-6/10 h-auto mb-6" />

                <GeneralInfos
                    componentClassName="flex flex-col gap-y-1 text-white w-full h-auto"
                    phoneIconClassName="w-[11px] h-full"
                    addressIconClassName="w-[11px] h-full"
                    birthDateIconClassName="w-[11px] h-full"
                    emailIconClassName="w-[11px] h-full"
                    phoneNumberClassName="text-[10px]"
                    emailClassName="text-[10px]"
                    addressClassName="text-[10px]"
                    birthDateClassName="text-[10px]"
                />

                <SocialLinks
                    componentClassName="mt-6 text-left w-full"
                    titleClassName="text-sm font-semibold text-left text-white w-full"
                    linkPlatformClassName="text-xs text-white font-semibold"
                    linkUrlClassName="text-xs underline text-gray-200 hover:text-white"
                />

                <Skills 
                    componentClassName="mt-6 text-left w-full"
                    titleClassName="text-sm font-semibold text-white w-full"
                    skillNameClassName="text-xs text-white font-semibold"
                    skillLevelClassName="text-xs text-gray-200 font-medium"
                    skillLevelBarBackgroundClassName="w-full relative rounded-full bg-gray-400 h-1"
                    skillLevelBarClassName="absolute top-0 left-0 h-full rounded-full bg-white"
                />
            </div>
            <div className="p-5">
                <AboutMe 
                    componentClassName="mb-4"
                    titleClassName="text-sm font-semibold text-left text-gray-700 w-full" 
                    contentClassName="text-[10px] text-left text-gray-700 w-full" 
                />
            </div>
        </div>
    )
}

export default CastorTemplate;