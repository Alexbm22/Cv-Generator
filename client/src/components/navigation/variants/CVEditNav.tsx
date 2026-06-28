import { useState } from "react";
import { useCvEditStore } from "../../../Store";
import DownloadBtn from "../../features/CV/downloadBtn";
import { BaseNav, ProfileDropdown } from "../shared";
import DeleteBtn from "../../features/CV/deleteBtn";
import BackBtn from "../../UI/Buttons/backBtn";
import CvEditorTypeSelector from "../../features/CV/CVEditor/CvEditorTypeSelector";
import { getFlagFromLanguage } from "../../../constants/CV/languageFlagMap";
import CVLanguageDialog from "../../UI/CVLanguageDialog";

const CVEditNav = () => {

    const cvId = useCvEditStore(state => state.id);
    const cvTitle = useCvEditStore(state => state.title);
    const editorType = useCvEditStore(state => state.editorType);
    const language = useCvEditStore(state => state.language);
    const setEditorType = useCvEditStore(state => state.setEditorType);

    const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

    const { svg: languageFlag, label: languageLabel } = getFlagFromLanguage(language);

    return (
        <>
        <CVLanguageDialog
            isOpen={languageDialogOpen}
            onClose={() => setLanguageDialogOpen(false)}
        />
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
            centerItems={[
                {
                    id: 'editor-type-selector',
                    component: (
                        <div className="flex items-center h-full">
                            <CvEditorTypeSelector
                                value={editorType}
                                onChange={setEditorType}
                            />
                        </div>
                    )
                }
            ]}
            rightItems={[
                {
                    id: 'download',
                    component: (
                        <div className="flex flex-row items-center gap-2.5 h-full">
                            {/* Flag — language selector trigger */}
                            <button
                                type="button"
                                aria-label={languageLabel}
                                onClick={() => setLanguageDialogOpen(true)}
                                className="h-[90%] w-auto px-2 rounded-xl border border-black/[0.06] bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.10)] cursor-pointer hover:bg-black/[0.05] flex items-center justify-center transition-all duration-350 active:scale-95"
                            >
                                <img
                                    src={languageFlag}
                                    alt={languageLabel}
                                    className="w-auto h-5 rounded-[3px] object-cover"
                                />
                            </button>

                            {/* Action group */}
                            <div className="flex flex-row h-[90%] items-center rounded-xl border border-black/[0.06] bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.10)] px-1 gap-0">
                                <DownloadBtn
                                    CVId={cvId}
                                    className="bg-transparent h-[80%] shadow-none border-none hover:bg-black/[0.05] rounded-lg transition-colors duration-150"
                                    iconClassName="w-5 h-5 text-[#0056b3]"
                                />
                                <div className="w-px h-4 bg-black/10 rounded-full" />
                                <DeleteBtn
                                    CVId={cvId}
                                    className="bg-transparent h-[80%] shadow-none border-none hover:bg-red-50 rounded-lg transition-colors duration-150"
                                    iconClassName="w-5 h-5 text-[#d32f2f]"
                                />
                            </div>
                        </div>
                    )
                }, {
                    id: 'profile-dropdown',
                    component: (
                        <div className="flex w-full h-[90%]">
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
                            className="flex h-full items-center max-w-[140px] sm:max-w-[220px]"
                        >
                            <h1 className="text-lg sm:text-[23px] font-serif select-none truncate">{cvTitle}</h1>
                        </div>
                    )
                }
            ]}
        />
        </>
    )
}

export default CVEditNav;