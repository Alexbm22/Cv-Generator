import { useParams } from "react-router-dom";
import CVEditorForm  from "./CVForm";
import CVPreview from "../../components/features/CV/CVPreview";
import useFetchCV from "./useFetchCV";
import { useCvEditStore, useCVsStore } from "../../Store";
import { useEffect, useRef, useState } from "react";
import { FileText, Minimize2 } from 'lucide-react';
import { CVEditNav } from "../../components/navigation";
import CVPreviewImage from "../../components/features/CV/CVPreviewImage";
import TemplateEditor from "../../components/features/CV/CVEditor/TemplateEditor";
import AiEditor from "../../components/features/CV/CVEditor/AiEditor";

const CVEditPage = () => {
    const { id } = useParams<{id: string}>();

    const CVState = useCVsStore(state => state.CVState);
    const editorType = useCvEditStore(state => state.editorType);
    const [ isShowingPreview, setIsShowingPreview ] = useState(true);

    const scrollPosition = useRef<{ [key: string]: number }>({});
    
    useEffect(() => {
        const handleScroll = () => {
            scrollPosition.current[editorType] = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [editorType]);

    useEffect(() => {
        const pos = scrollPosition.current[editorType] || 0;
        window.scrollTo(0, pos);
    }, [editorType]);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1300px)");
        setIsShowingPreview(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setIsShowingPreview(e.matches);
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, []);
    
    useFetchCV({id});

    return (
        <>
            <div className="flex flex-col h-screen">
                <CVEditNav />
                <div className="flex transition-all duration-1000 w-full flex-1 relative pt-15" style={{ scrollbarGutter: 'stable' }}>
                    <div className={editorType !== 'form' ? 'hidden' : 'contents'}><CVEditorForm isShowingPreview={isShowingPreview} /></div>
                    <div className={editorType !== 'template' ? 'hidden' : 'contents'}><TemplateEditor isShowingPreview={isShowingPreview} /></div>
                    <div className={editorType !== 'ai' ? 'hidden' : 'contents'}><AiEditor isShowingPreview={isShowingPreview} /></div>
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