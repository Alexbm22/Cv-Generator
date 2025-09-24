import React from "react";

type ComponentProps = {
    OnClick: () => void;
    sectionName: string;
}

const AddSectionButton: React.FC<ComponentProps> = ({ OnClick, sectionName }) => {

    return (
        <button onClick={OnClick} className="font-medium text-md p-1 pl-3 pr-3 text-[#007dff] w-fit cursor-pointer bg-[#eaf3fe] 
            hover:bg-[#dbe6f4] transition-colors duration-200 rounded-md"
        >
            {'+ Add ' + sectionName}
        </button>
    )
}

export default AddSectionButton;