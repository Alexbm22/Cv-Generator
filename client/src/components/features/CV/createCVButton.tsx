import React from "react";
import { useCreateUserCV, useCreateGuestCV } from "../../../hooks/CVs/useCVs";
import { useCVsStore } from "../../../Store";
import { CVStateMode } from "../../../interfaces/cv";
import Button from "../../UI/button";

const CreateCVBtn: React.FC = () => {
    const { mutate: createUserCV } = useCreateUserCV();
    const { mutate: createGuestCV } = useCreateGuestCV();
    const CVState = useCVsStore(state => state.CVState)

    return (
        <Button 
            onClick={() => {
                CVState.mode === CVStateMode.USER ? createUserCV() : createGuestCV()
            }}
            className="p-2"
        >
            + Create New CV
        </Button>
    )
} 

export default CreateCVBtn;