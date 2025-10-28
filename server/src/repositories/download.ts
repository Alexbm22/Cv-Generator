import { DownloadAttributes, DownloadCreationAttributes, DownloadWithMediaFiles } from "@/interfaces/downloads";
import { Download, MediaFiles } from "@/models";

const createDownload = async (criteria: DownloadCreationAttributes) => {
    return await Download.create(criteria)
}

const getDownloadsWithMediaFiles = async (criteria: Partial<DownloadAttributes>) => {
    return await Download.findAll({
        where: criteria,
        include: [{
            model: MediaFiles,
            as: 'mediaFiles'
        }]
    }) as DownloadWithMediaFiles[]
}

const getDownloadWithMediaFiles = async (criteria: Partial<DownloadAttributes>) => {
    return await Download.findOne({
        where: criteria,
        include: [{
            model: MediaFiles,
            as: 'mediaFiles'
        }]
    }) as DownloadWithMediaFiles | null;
}

const deleteDownload = async (user_id: number, downloadId?: string) => {
    const whereClause = {
        user_id,
        ...(downloadId && { public_id: downloadId }) // if no downloadId is provided, delete all downloads for this user
    };

    return await Download.destroy({ 
        where: whereClause,
        individualHooks: true 
    });
}

export default {
    createDownload,
    getDownloadsWithMediaFiles,
    getDownloadWithMediaFiles,
    deleteDownload
}