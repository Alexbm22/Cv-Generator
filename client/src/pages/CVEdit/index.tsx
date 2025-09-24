import { useParams } from "react-router-dom";
import CVEditorForm  from "../..//components/features/CV/CVEditor/CVForm";
import CVPreview from "../../components/features/CV/CVEditor/CVPreview/CVPreview";
import { useFetchGuestCV, useFetchUserCV } from "./useFetchCV";
import { useCVsStore } from "../../Store";
import { CVStateMode } from "../../interfaces/cv";
import { useEffect, useState } from "react";
import CVPreviewImage from "../../components/UI/CVPreviewImage";

const CVEditPage = () => {
    const { id } = useParams<{id: string}>();
    const CVState = useCVsStore(state => state.CVState);
    
    const [ isShowingPreview, setIsShowingPreview ] = useState(true)
    
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1300px)");

        // setăm valoarea inițială
        setIsShowingPreview(mediaQuery.matches);

        // ascultăm când se schimbă dimensiunea
        const handler = (e: MediaQueryListEvent) => setIsShowingPreview(e.matches);
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    
    if(CVState.mode === CVStateMode.USER) {
        const { isLoading, CV } = useFetchUserCV(id);

        if (isLoading) {
            return <div>Loading...</div>;
        } else if(!CV) {
            return <div>No selected cv!</div>
        }
    } else {
        const { isLoading } = useFetchGuestCV(id);

        if (isLoading) {
            return <div>Loading...</div>;
        }
    }

    return (
        <div className="flex flex-column transition-all duration-1000 w-full h-full relative">
            <CVEditorForm isShowingPreview={isShowingPreview}/>
            <CVPreview isShowingPreview={isShowingPreview}/>
            <button 
                onClick={() => setIsShowingPreview(!isShowingPreview)}
                className="fixed cursor-pointer w-22 h-22 bg-[#007dff] rounded-full bottom-5 right-5 
                    text-2xl z-50 shadow-2xl opacity-[70%] hover:opacity-100 transition-all duration-300 p-4
                    flex items-center justify-center
                "  
            >
                {
                    isShowingPreview ? "Icon" : (
                        
                        <div className="flex items-center justify-center  w-10 ">
                            <CVPreviewImage CV={CVState.selectedCV!} FallbackComponent={() => (
                                <>
                                    Some Icon
                                </>
                            )}/>
                        </div>
                    )
                }
            </button>
        </div>
    );
}

export default CVEditPage;