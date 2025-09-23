import React from "react";

type ComponentProps = {
    OnClick: () => void;
    sectionName: string;
}

const AddSectionButton: React.FC<ComponentProps> = ({ OnClick, sectionName }) => {

    return (
        <button onClick={OnClick} className="font-medium text-md text-[#007dff] w-fit cursor-pointer">
            {'+ Add ' + sectionName}
        </button>
    )
}

export default AddSectionButton;