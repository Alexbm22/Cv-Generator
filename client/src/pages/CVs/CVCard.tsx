import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { CVAttributes, CVMetadataAttributes } from "../../interfaces/cv";
import { useDeleteCV } from "../../hooks/CVs/useCVs";
import DownloadBtn from "../../components/features/pdf/download";
import { useState } from "react";

type CVCardProps = {
    CV: CVMetadataAttributes
}

const CVCard: React.FC<CVCardProps> = ({CV}) => {
    
    if(!CV.id) return;

    const navigate = useNavigate();
    const [ isCVPreview, setIsCVPreview ] = useState(true)

    const { mutate: deleteCV } = useDeleteCV(CV.id);

    const handleEditClick = () => {
        navigate(
            routes.editResume.path.replace(/:id$/, CV.id ?? "" ), 
            { replace: true }
        )
    }

    return (
        <>
            <div className="flex flex-col gap-3 p-4 m-4 items-center bg-gray-100 w-[calc(100vw*0.18)] h-80 rounded-lg">
                <div onClick={handleEditClick} className="w-full h-70">
                    {
                        isCVPreview && CV.preview?.presigned_get_URL ? (
                            <img 
                                src={CV.preview.presigned_get_URL} 
                                alt="preview image" onClick={handleEditClick}
                                onError={() => {
                                    setIsCVPreview(false);
                                }}
                            /> 
                        ) : (
                            <div className="flex w-full h-full bg-gray-200 justify-center items-center rounded-md">
                                No preview available
                            </div>
                        )
                    }
                </div>
                <div className="w-full">
                    <div className="">
                        {CV.title !== '' ? CV.title : 'Your CV'} 
                    </div>
                    <div className="flex flex-row gap-2">
                        <DownloadBtn downloadedCV={CV} />
                        <button onClick={handleEditClick}>
                            edit
                        </button>
                        <button onClick={() => {
                            deleteCV();
                        }}>
                            delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CVCard;