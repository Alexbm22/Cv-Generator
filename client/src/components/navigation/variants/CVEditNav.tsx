import { useCvEditStore } from "../../../Store";
import DownloadBtn from "../../features/CV/downloadBtn";
import { BaseNav, ProfileDropdown } from "../shared";
import DeleteBtn from "../../features/CV/deleteBtn";
import BackBtn from "../../UI/Buttons/backBtn";

const CVEditNav = () => {

    const cvId = useCvEditStore(state => state.id);
    const cvTitle = useCvEditStore(state => state.title);

    return (
        <BaseNav
            position="fixed"
            height="h-15"
            backgroundColor="bg-[#eff5ff7c]"
            blur={true}
            border={true}
            shadow={true}
            zIndex={50}
            className="top-0 left-0 right-0 text-[#2e69c8]"
            responsiveStyle={`px-cv-editor-padding pt-2 pb-2`}
            itemsContainerStyle="h-full"
            rightItems={[
                {
                    id: 'download',
                    component: (
                        <div className="flex flex-row shadow-xs border border-[#bababa5b] items-center rounded-lg px-1 py-0.5 h-full sm:font-medium text-[#007dff] bg-[#e2f0ffda]">
                            
                            <DownloadBtn 
                                CVId={cvId} 
                                className="bg-transparent shadow-none border-none sm:hover:bg-transparent hover:bg-transparent"
                                iconClassName="w-6 h-6"
                            />

                            <DeleteBtn 
                                CVId={cvId}
                                className="bg-transparent shadow-none border-none sm:hover:bg-transparent hover:bg-transparent"
                                iconClassName="w-6 h-6"
                            />
                        </div>
                    )
                }, {
                    id: 'profile-dropdown',
                    component: (
                        <div className="flex w-full h-full">
                            <ProfileDropdown />
                        </div>
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