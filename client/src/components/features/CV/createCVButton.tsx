import React from "react";
import { useCreateUserCV, useCreateGuestCV } from "../../../hooks/CVs/useCVs";
import { useCVsStore } from "../../../Store";
import { CVStateMode } from "../../../interfaces/cv";


const CreateCVBtn: React.FC = () => {
    const { mutate: createUserCV } = useCreateUserCV();
    const { mutate: createGuestCV } = useCreateGuestCV();
    const CVState = useCVsStore(state => state.CVState)

    const handleCreateCV = () => {
        if (CVState.mode === CVStateMode.USER) {
            createUserCV();
        } else {
            createGuestCV();
        }
    };

    return (
        <button
            onClick={handleCreateCV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#006edb]
                text-white text-sm font-medium tracking-tight
                shadow-sm transition-all duration-200 ease-out
                hover:shadow-md active:scale-[0.97] cursor-pointer"
        >
            <span className="text-base leading-none">+</span>
            New Resume
        </button>
    )
} 

export default CreateCVBtn;