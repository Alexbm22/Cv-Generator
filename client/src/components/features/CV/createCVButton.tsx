import React from "react";
import { useCreateCV } from "../../../hooks/CVs/useCVs";

const CreateCVBtn: React.FC = () => {
    const { mutate: createCV } = useCreateCV();

    return (
        <button
            onClick={() => {
                createCV()
            }}
        >
            Create New CV
        </button>
    )
} 

export default CreateCVBtn;