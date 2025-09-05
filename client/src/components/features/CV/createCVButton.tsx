import React from "react";
import { useCreateUserCV } from "../../../hooks/CVs/useCVs";

const CreateCVBtn: React.FC = () => {
    const { mutate: createCV } = useCreateUserCV();

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