import React from "react";
import Button from "./button";

type LegacyComponentProps = {
    OnClick: () => void;
    sectionName: string;
}

const AddSectionButton: React.FC<LegacyComponentProps> = ({ OnClick, sectionName }) => {
    return (
        <Button onClick={OnClick}>
            {'+ Add ' + sectionName}
        </Button>
    )
}

export default AddSectionButton;