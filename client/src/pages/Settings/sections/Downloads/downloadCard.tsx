import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Expand, FilePenLine, LoaderCircle, Trash2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DownloadAttributes } from "../../../../interfaces/downloads";
import { DownloadService } from "../../../../services/download";
import { useImageWithFallback } from "../../../../hooks/useImageWithFallback";
import { useDownloadsStore } from "../../../../Store/useDownloadsStore";
import { useDuplicateDownload } from "../../../../hooks/useDownload";

type DownloadCardProps = {
    download: DownloadAttributes;
}

const DownloadCard: React.FC<DownloadCardProps> = ({download}) => {

    const deleteDownload = useDownloadsStore(state => state.deleteDownload);
    const queryClient = useQueryClient();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { mutate: duplicateDownload, isPending: isReusing } = useDuplicateDownload();
    const { mutate: redownload, isPending: isRedownloading } = useMutation({
        mutationFn: () => DownloadService.redownloadFile(download),
    });
    const { mutate: removeDownload, isPending: isDeleting } = useMutation({
        mutationFn: () => DownloadService.deleteDownload(download.id),
        onSuccess: async () => {
            deleteDownload(download.id);
            await queryClient.invalidateQueries({ queryKey: ['downloads'] });
        }
    });
    
    const downloadPreviewSrc = download.downloadPreview.get_URL;
    const DownloadPreview = useImageWithFallback({
        src: downloadPreviewSrc ? downloadPreviewSrc : null, 
        FallbackComponent: () => <div className="flex h-full items-center justify-center text-xs text-gray-400">Preview unavailable</div>,
        alt: "Download Preview",
        className: "h-full w-full object-cover"
    })
    
    if(!download.id) return;

    const isBusy = isRedownloading || isReusing || isDeleting;
    const date = new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(download.createdAt));

    const handleRedownload = () => { redownload(); };
    const handleDuplicate = () => { 
        duplicateDownload(download.id);
    };

    const handleDelete = () => {
        removeDownload();
    }

    return (
        <article className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 border-b border-gray-200 p-4 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:p-5">
            <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <div className="group relative h-20 w-16 overflow-hidden rounded-md border border-gray-200 bg-gray-50 sm:h-27 sm:w-[80px]">
                    {DownloadPreview}
                    {downloadPreviewSrc && (
                        <Dialog.Trigger asChild>
                            <button
                                type="button"
                                aria-label="View download preview"
                                title="View download preview"
                                className="absolute inset-0 grid place-items-center bg-[#00000049] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 focus:outline-none cursor-pointer"
                            >
                                <Expand className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </Dialog.Trigger>
                    )}
                </div>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                setIsPreviewOpen(false);
                            }
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    >
                        <Dialog.Title className="sr-only">Download preview</Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                aria-label="Close download preview"
                                title="Close preview"
                                className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </Dialog.Close>
                        {downloadPreviewSrc && (
                            <img
                                src={downloadPreviewSrc}
                                alt={`Preview of ${download.fileName}`}
                                className="max-h-[calc(100vh-2rem)] max-w-full object-contain shadow-2xl"
                            />
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{download.fileName}</p>
                <p className="mt-1 text-xs text-gray-500">Created {date}</p>
            </div>
            <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1" aria-label={`Actions for ${download.fileName}`}>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRedownload}
                        disabled={isBusy}
                        title="Download PDF"
                        aria-label="Download PDF"
                        className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2f2f7] text-[#1d1d1f] transition-colors duration-150 hover:bg-[#e5e5ea] active:bg-[#d1d1d6] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                        {isRedownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isBusy}
                        title="Delete this downloaded version"
                        aria-label="Delete this downloaded version"
                        className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2f2f7] text-red-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-500 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                        {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                </div>
                
                <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

                <button
                    type="button"
                    onClick={handleDuplicate}
                    disabled={isBusy}
                    title="Reuse this version in the editor"
                    aria-label="Reuse this version in the editor"
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f2f2f7] px-4 text-sm font-medium text-[#1d1d1f] transition-colors duration-150 hover:bg-[#e5e5ea] active:bg-[#d1d1d6] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                    {isReusing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FilePenLine className="h-4 w-4" />}
                    <span>Reuse</span>
                </button>
            </div>
        </article>
    )
}

export default DownloadCard;