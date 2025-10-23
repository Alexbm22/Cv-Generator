import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import { useDeleteCV } from "../../hooks/CVs/useCVs";
import DownloadBtn from "../../components/features/pdf/downloadBtn";
import CVPreviewImage from "../../components/UI/CVPreviewImage";
import { Edit, Trash2 } from 'lucide-react';

type CVCardProps = {
    CV: GuestCVAttributes | UserCVMetadataAttributes
}

const CVCard: React.FC<CVCardProps> = ({CV}) => {
    
    if(!CV.id) return;

    const navigate = useNavigate();

    const { mutate: deleteCV } = useDeleteCV(CV.id);

    const handleEditClick = () => {
        navigate(
            routes.editResume.path.replace(/:id$/, CV.id ?? "" ), 
            { replace: true }
        )
    }

    return (
        <>
            <div className="group flex flex-col gap-3 p-3 sm:p-3 items-center bg-[#eef6f9] 
                w-full md:w-[250px] lg:w-[280px] xl:w-[290px] 
                h-auto rounded-xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-lg">
                <div onClick={handleEditClick} className="w-full relative rounded-md overflow-hidden aspect-[3/4]">
                    <CVPreviewImage 
                        CV={CV} 
                        FallbackComponent={() => (
                            <div className="flex w-full h-full bg-[#ffffff] justify-center items-center rounded-md">
                                No preview available
                            </div>
                        )} 
                        className="w-full h-full object-cover cursor-pointer"
                    />
                    <div className="absolute bottom-2 right-2 p-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200">    
                    </div>
               </div>
                <div className="flex flex-col sm:flex-row justify-between w-full gap-3 sm:gap-0">

                    <div className="flex flex-col h-full">
                        <div className="font-semibold overflow-hidden text-sm sm:text-base md:text-lg text-[#292929] truncate">
                            {CV.title !== '' ? CV.title : 'Your CV'}
                        </div>
                        <div className="font-semibold overflow-hidden  text-[13px] sm:text-xs lg:text-[13.5px] text-[#5d5d5d] -mt-1">
                            created: {CV.createdAt ? new Date(CV.createdAt).toLocaleDateString() : ''}
                        </div>
                    </div>

                    <div className="flex flex-row gap-1 sm:gap-2 font-medium text-[#007dff] bg-[#e3eefb] p-2 sm:p-2.5 
                        hover:bg-[#dbe6f4] transition-colors duration-200 rounded-md self-start sm:self-auto"
                    >
                        <DownloadBtn 
                            CVId={CV.id} 
                            className="cursor-pointer hover:text-[#90c5fa] transition-colors duration-200 touch-manipulation p-l-1 p-r-1"
                            iconClassName="w-4 h-4 sm:w-5 sm:h-5"
                        />

                        <button 
                            onClick={handleEditClick} 
                            className="cursor-pointer hover:text-[#90c5fa] transition-colors duration-200 touch-manipulation p-1"
                        > <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> </button>

                        <button 
                            onClick={() => { deleteCV() }}
                            className="cursor-pointer hover:text-[#90c5fa] transition-colors duration-200 touch-manipulation p-1"
                        > <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CVCard;