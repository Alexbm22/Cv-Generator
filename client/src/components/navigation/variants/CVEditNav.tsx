import { useCvEditStore } from "../../../Store";
import DownloadBtn from "../../features/CV/downloadBtn";
import { BaseNav } from "../shared";
import DeleteBtn from "../../features/CV/deleteBtn";
import ProfileBtn from "../../features/CV/profileBtn";
import BackBtn from "../../features/CV/backBtn";

const CVEditNav = () => {

    const cvId = useCvEditStore(state => state.id);
    const cvTitle = useCvEditStore(state => state.title);

    return (
        <BaseNav
            position="sticky"
            height="h-15"
            backgroundColor="bg-[#eff5ff7c]"
            blur={true}
            border={true}
            shadow={true}
            zIndex={50}
            className="top-0 text-[#2e69c8]"
            responsiveStyle={`px-cv-editor-padding pt-2 pb-2`}
            itemsContainerStyle="h-full"
            rightItems={[
                {
                    id: 'download',
                    component: (
                        <div className="flex flex-row items-center rounded-md px-1.5 py-1 h-full gap-1 sm:font-medium text-[#007dff] bg-[#e2f0ffda]">
                            
                            <DownloadBtn 
                                CVId={cvId} 
                                className="bg-transparent sm:hover:bg-transparent hover:opacity-65 hover:bg-transparent"
                                iconClassName="w-6 h-6 sm:w-6.5 h-6.5"
                            />

                            <DeleteBtn 
                                CVId={cvId}
                                className="bg-transparent h-fit hover:bg-transparent hover:opacity-65 sm:hover:bg-transparent"
                                iconClassName="w-6 h-6 sm:w-7 h-7"
                            />
                        </div>
                    )
                }, {
                    id: 'profile-btn',
                    component: (
                        <ProfileBtn 
                            iconClassName="w-6 h-6 sm:w-7 h-7"
                        />
                    )
                }
            ]}
            leftItems={[
                {
                    id: 'back-btn',
                    component: (
                        <BackBtn 
                            className=""
                            iconClassName="w-6 h-6 sm:w-6.5 h-6.5"
                        />
                    )
                },
                {
                    id: 'cv-title',
                    component: (
                        <div
                            className="flex h-full items-center"
                        >
                            <h1 className="text-lg sm:text-[23px] font-serif select-none">{cvTitle}</h1>
                        </div>
                    )
                }
            ]}
        />
    )
}

export default CVEditNav;