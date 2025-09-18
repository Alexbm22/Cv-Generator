import { useParams } from "react-router-dom";
import CVEditorForm  from "../..//components/features/CV/CVEditor/CVForm";
import CVPreview from "../../components/features/CV/CVEditor/CVPreview/CVPreview";
import { useFetchGuestCV, useFetchUserCV } from "./useFetchCV";
import { useCVsStore } from "../../Store";
import { CVStateMode } from "../../interfaces/cv";

const CVEditPage = () => {
    const { id } = useParams<{id: string}>();
    const CVState = useCVsStore(state => state.CVState);
    
    if(CVState.mode === CVStateMode.USER) {
        const { isLoading, CV } = useFetchUserCV(id);

        if (isLoading) {
            return <div>Loading...</div>;
        } else if(!CV) {
            return <div>No selected cv!</div>
        }
    } else {
        useFetchGuestCV(id);
    }

    return (
        <div className="flex flex-column w-full h-full relative">
            <CVEditorForm/>
            <CVPreview />
        </div>
    );
}

export default CVEditPage;