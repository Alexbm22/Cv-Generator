import React from "react";
import Button from "./Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";


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