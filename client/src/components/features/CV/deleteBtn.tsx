import React from "react";
import { useDeleteCV } from "../../../hooks/CVs/useCVs";
import { Trash2 } from 'lucide-react';
import Button from "../../UI/Buttons/Button";
import { ButtonStyles } from "../../../constants/CV/buttonStyles";

type DeleteBtnProps = {
    CVId: string;
    className?: string;
    iconClassName?: string;
    size?: number;
    onDeleteStart?: () => void;
    onDeleteComplete?: () => void;
}

const DeleteBtn: React.FC<DeleteBtnProps> = ({
    CVId, 
    className, 
    iconClassName, 
    size,
    onDeleteStart,
    onDeleteComplete
}) => {

    const { mutate: deleteCV, isPending: isDeleting } = useDeleteCV(CVId);

    const handleDeleteClick = () => {

        onDeleteStart?.();
        deleteCV(undefined, {
            onSuccess: () => {
                onDeleteComplete?.();
            },
        });
    };

    return (
        <Button 
            buttonStyle={ButtonStyles.danger}
            className={className}
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label={`Delete ${CVId}`}
            title={`Delete ${CVId}`}
            >
            <Trash2 
                size={size} 
                className={`${iconClassName} ${isDeleting ? 'animate-pulse' : ''}`} 
            />
        </Button>
    );
};

export default DeleteBtn;