import { useParams } from "react-router-dom";
import CVEditorForm  from "../..//components/features/CV/CVEditor/CVForm";
import CVPreview from "../../components/features/CV/CVEditor/CVPreview/CVPreview";
import useFetchCV from "./useFetchCV";
import { useCVsStore } from "../../Store";
import { useEffect, useState } from "react";
import { FileText, Minimize2 } from 'lucide-react';
import CVPreviewImage from "../../components/UI/CVPreviewImage";
import { CVEditNav } from "../../components/navigation";

const PagePadding = 'p-10';

const CVEditPage = () => {
    const { id } = useParams<{id: string}>();

    const CVState = useCVsStore(state => state.CVState);
    const [ isShowingPreview, setIsShowingPreview ] = useState(true);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1300px)");

        // setăm valoarea inițială
        setIsShowingPreview(mediaQuery.matches);

        // ascultăm când se schimbă dimensiunea
        const handler = (e: MediaQueryListEvent) => setIsShowingPreview(e.matches);
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, []);
    
    useFetchCV({id});

    return (
        <>
            <div className="flex flex-col">
                <CVEditNav />
                <div className="flex transition-all duration-1000 w-full h-fit relative">
                    <CVEditorForm isShowingPreview={isShowingPreview} />
                    <CVPreview isShowingPreview={isShowingPreview}/>
                    <button 
                        onClick={() => setIsShowingPreview(!isShowingPreview)}
                        className="fixed cursor-pointer w-22 h-22 bg-[#007dff] rounded-full bottom-5 right-5 
                            text-2xl z-50 shadow-2xl opacity-[70%] hover:opacity-100 transition-all duration-300 p-4
                            flex items-center justify-center"  
                    >
                        {
                            isShowingPreview ? <Minimize2 size={35} className="text-[#d3e8ff]"/> : (
                                
                                <div className="flex items-center justify-center  w-10 ">
                                    <CVPreviewImage CV={CVState.selectedCV!} FallbackComponent={() => (
                                        <FileText size={40} className="text-[#d3e8ff]"/>
                                    )}/>
                                </div>
                            )
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

export default CVEditPage;