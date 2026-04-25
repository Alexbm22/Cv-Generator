import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/routes";
import { GuestCVAttributes, UserCVMetadataAttributes } from "../../interfaces/cv";
import DownloadBtn from "../../components/features/CV/downloadBtn";
import DeleteBtn from "../../components/features/CV/deleteBtn";
import { Edit } from 'lucide-react';
import CVPreviewImage from "../../components/features/CV/CVPreviewImage";

type CVCardProps = {
    CV: GuestCVAttributes | UserCVMetadataAttributes;
};

// Shared style for the square icon action buttons
const iconBtnBase =
    "flex items-center justify-center w-8 h-8 rounded-xl transition-colors duration-150 flex-shrink-0";

const CVCard: React.FC<CVCardProps> = ({ CV }) => {
    const navigate = useNavigate();

    if (!CV.id) {
        return (
            <div className="flex flex-col gap-2 items-center bg-white/60 rounded-2xl p-3 opacity-40">
                <div className="text-[#6e6e73] text-xs">Invalid CV</div>
            </div>
        );
    }

    const handleEditClick = () => {
        navigate(routes.editResume.path.replace(/:id$/, CV.id ?? ""));
    };

    const formatDate = (dateString: string | Date) => {
        try {
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return 'Unknown date';
        }
    };

    const cvTitle = CV.title?.trim() || 'Untitled CV';

    return (
        <div className="group/card flex flex-col bg-white rounded-2xl overflow-hidden
            shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.07)]
            hover:shadow-xl
            transition-all duration-300 ease-out hover:-translate-y-0.5
            px-3 py-2.5">

            <div>
                <div
                    onClick={handleEditClick}
                    role="button"
                    aria-label={`Open ${cvTitle}`}
                    className="relative overflow-hidden rounded-xl cursor-pointer
                        aspect-[210/297] bg-gray-100 shadow-inner group/thumb"
                >
                    <CVPreviewImage
                        CV={CV}
                        FallbackComponent={() => (
                            <div className="flex w-full h-full bg-gray-100 flex-col items-center justify-center gap-1.5">
                                <span className="text-4xl select-none">📄</span>
                                <span className="text-[11px] text-[#6e6e73]">No preview</span>
                            </div>
                        )}
                        className="w-full h-full object-contain object-top transition-transform duration-300 group-hover/thumb:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors duration-300 rounded-xl" />
                </div>
            </div>

            {/* Footer */}
            <div className="pt-2.5 flex flex-col gap-2.5">

                {/* Meta */}
                <div className="min-w-0">
                    <h3
                        title={cvTitle}
                        className="font-semibold text-[13px] leading-snug text-[#1d1d1f] truncate"
                    >
                        {cvTitle}
                    </h3>
                    <p className="text-[11px] text-[#6e6e73] mt-0.5 leading-tight">
                        {CV.createdAt ? formatDate(CV.createdAt) : '—'}
                    </p>
                </div>

                {/* Action row */}
                <div className="flex items-center gap-1.5">
                    {/* Edit — primary, takes remaining space */}
                    <button
                        onClick={handleEditClick}
                        title="Edit CV"
                        aria-label={`Edit ${cvTitle}`}
                        className="flex flex-1 items-center justify-center gap-1.5 h-8 rounded-xl
                            bg-[#f2f2f7] hover:bg-[#e5e5ea] active:bg-[#d1d1d6]
                            text-[#1d1d1f] text-[12px] font-medium
                            transition-colors duration-150 cursor-pointer"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>

                    {/* Download */}
                    <DownloadBtn
                        CVId={CV.id}
                        iconClassName="w-4 h-4"
                        className={`${iconBtnBase} !bg-[#f2f2f7] !border-0 !shadow-none !p-0 !h-8 !w-8
                            !max-w-none !min-w-0 !self-auto !rounded-xl !text-[#1d1d1f]
                            hover:!bg-[#e5e5ea] active:!bg-[#d1d1d6] !flex !items-center !justify-center`}
                    />

                    {/* Delete */}
                    <DeleteBtn
                        CVId={CV.id}
                        iconClassName="w-4 h-4"
                        className={`${iconBtnBase} !bg-[#f2f2f7] !border-0 !shadow-none !p-0 !h-8 !w-8
                            !max-w-none !min-w-0 !self-auto !rounded-xl !text-red-400
                            hover:!bg-red-50 hover:!text-red-500 active:!bg-red-100 !flex !items-center !justify-center`}
                    />
                </div>
            </div>
        </div>
    );
};

export default CVCard;