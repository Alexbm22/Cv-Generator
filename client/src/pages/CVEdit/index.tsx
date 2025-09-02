import { useParams } from "react-router-dom";
import CVEditorForm  from "../..//components/features/CV/CVEditor/CVForm";
import CVPreview from "../../components/features/CV/CVEditor/CVPreview/CVPreview";
import { useFetchCV } from "./useFetchCV";

const CVEditPage = () => {
    const { id } = useParams<{id: string}>();
    
    const { isLoading, CV } = useFetchCV(id);

    if (isLoading) {
        return <div>Loading...</div>;
    } else if(!CV) {
        return <div>No selected cv!</div>
    }
    
    return (
        <div className="flex flex-column w-full h-full relative">
            <CVEditorForm/>
            <CVPreview />
        </div>
    );
}

export default CVEditPage;