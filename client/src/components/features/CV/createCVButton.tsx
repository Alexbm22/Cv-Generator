import React from "react";
import { useCreateUserCV, useCreateGuestCV } from "../../../hooks/CVs/useCVs";
import { useCVsStore } from "../../../Store";
import { CVStateMode } from "../../../interfaces/cv";

const CreateCVBtn: React.FC = () => {
    const { mutate: createUserCV } = useCreateUserCV();
    const { mutate: createGuestCV } = useCreateGuestCV();
    const CVState = useCVsStore(state => state.CVState)

    return (
        <button
            onClick={() => {
                CVState.mode === CVStateMode.USER ? createUserCV() : createGuestCV()
            }}
        >
            Create New CV
        </button>
    )
} 

export default CreateCVBtn;