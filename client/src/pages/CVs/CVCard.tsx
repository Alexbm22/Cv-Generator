import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import DownloadBtn from "../../components/features/CV/downloadBtn";
import DeleteBtn from "../../components/features/CV/deleteBtn";
import CVPreviewImage from "../../components/UI/CVPreviewImage";
import { Edit } from 'lucide-react';
import Button from "../../components/UI/Button";
import { ButtonStyles } from "../../constants/CV/buttonStyles";

type CVCardProps = {
    CV: GuestCVAttributes | UserCVMetadataAttributes;
};

const CVCard: React.FC<CVCardProps> = ({ CV }) => {
    // Early return with proper JSX
    if (!CV.id) {
        return (
            <div className="group flex flex-col gap-3 p-3 items-center bg-gray-100 
                w-full md:w-[250px] lg:w-[280px] xl:w-[290px] 
                h-auto rounded-xl opacity-50">
                <div className="text-gray-500 text-sm">Invalid CV</div>
            </div>
        );
    }

    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate(routes.editResume.path.replace(/:id$/, CV.id ?? ""));
    };

    const formatDate = (dateString: string | Date) => {
        try {
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Unknown date';
        }
    };

    const cvTitle = CV.title?.trim() || 'Untitled CV';

    return (
        <div className="group flex flex-col gap-3 p-3 sm:p-3 items-center bg-[#eef6f9] 
                w-full md:w-[250px] lg:w-[280px] xl:w-[290px] h-auto rounded-xl 
                overflow-hidden transition-all duration-200 shadow-md hover:shadow-lg
                hover:transform hover:scale-[1.01] active:scale-[0.98]">
            
            {/* CV Preview Section */}
            <div 
                onClick={handleEditClick} 
                className="w-full relative rounded-md overflow-hidden aspect-[3/4] cursor-pointer group/preview"
                role="button"
                aria-label={`Edit CV: ${cvTitle}`}
            >       
                <CVPreviewImage 
                    CV={CV} 
                    FallbackComponent={() => (
                        <div className="flex w-full h-full bg-white justify-center items-center rounded-md border-2 border-dashed border-gray-300">
                            <div className="text-center text-gray-500">
                                <div className="text-2xl mb-2">📄</div>
                                <div className="text-sm">No preview available</div>
                            </div>
                        </div>
                    )} 
                    className="w-full h-full object-cover transition-transform duration-200"
                />
                
            </div>

            {/* CV Info and Actions */}
            <div className="flex flex-row justify-between w-full gap-3 sm:gap-2">
                
                {/* CV Details */}
                <div className="flex flex-col h-full flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg text-[#292929] 
                        truncate leading-tight" 
                        title={cvTitle}>
                        {cvTitle}
                    </h3>
                    <p className="font-medium text-[13px] sm:text-xs lg:text-[13.5px] text-[#5d5d5d] 
                        -mt-1 leading-tight">
                        Created: {CV.createdAt ? formatDate(CV.createdAt) : 'Unknown'}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row items-center p-2 rounded-sm bg-[#e3eefb] gap-1.5 hover:bg-[#dbe6f4] sm:gap-2">
                    
                    <DownloadBtn 
                        CVId={CV.id} 
                        className="bg-transparent p-0 sm:p-0"
                        iconClassName="w-4 h-4 sm:w-5 sm:h-5"
                    />

                    <Button 
                        onClick={handleEditClick} 
                        className="bg-transparent p-0 sm:p-0"
                        buttonStyle={ButtonStyles.secondary}
                        aria-label={`Edit ${cvTitle}`}
                        title="Edit CV"
                    > 
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    </Button>

                    <DeleteBtn 
                        CVId={CV.id}
                        className="bg-transparent p-0 sm:p-0"
                        iconClassName="w-4 h-4 sm:w-5 sm:h-5"
                    />
                </div>
            </div>
        </div>
    );
};

export default CVCard;