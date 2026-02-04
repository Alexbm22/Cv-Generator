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
            backgroundColor="bg-gradient-to-b backdrop-blur-md"
            blur={true}
            border={true}
            shadow={true}
            zIndex={50}
            className="top-0 left-0 right-0 border-blue-100/50"
            responsiveStyle={`px-cv-editor-padding py-1.5`}
            itemsContainerStyle="h-full"
            rightItems={[
                {
                    id: 'download',
                    component: (
                        <div className="flex flex-row h-full shadow-xs border border-blue-200/40 items-center rounded-lg px-2 py-1.5 gap-1 sm:font-medium text-[#007dff] bg-white/60 transition-all duration-500 hover:shadow-xs hover:bg-white/80">
                            
                            <DownloadBtn 
                                CVId={cvId} 
                                className="bg-transparent shadow-none border-none hover:bg-[#c5deff] rounded-lg transition-colors duration-150"
                                iconClassName="w-6 h-6 text-[#0056b3]"
                            />

                            <DeleteBtn 
                                CVId={cvId}
                                className="bg-transparent shadow-none border-none hover:bg-red-100 rounded-lg transition-colors duration-150"
                                iconClassName="w-6 h-6 text-[#d32f2f]"
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
                            className="px-2.5"
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