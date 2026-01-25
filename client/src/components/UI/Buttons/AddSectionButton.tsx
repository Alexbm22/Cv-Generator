import React from "react";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";
import Button from "./Button";


type LegacyComponentProps = {
    onClick: () => void;
    sectionName: string;
}

const AddSectionButton: React.FC<LegacyComponentProps> = ({ onClick: OnClick, sectionName }) => {
    return (
        <Button 
            onClick={OnClick}
            className="h-fit"
            buttonStyle={ButtonStyles.secondary}
        >
            {'+ Add ' + sectionName}
        </Button>
    )
}

export default AddSectionButton;