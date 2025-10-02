import { MediaFilesCreationAttributes } from "@/interfaces/mediaFiles";
import { MediaFiles } from "../models";

const getMediaFile = async (public_id: string) => {
    return await MediaFiles.findOne({
        where: {
            public_id,
        }
    });
}

const createMediaFile = async (mediaFile: MediaFilesCreationAttributes) => {
    return await MediaFiles.create(mediaFile);
}

const bulkCreateMediaFiles = async (mediaFiles: MediaFilesCreationAttributes[]) => {
    return await MediaFiles.bulkCreate(mediaFiles);
}

export default {
    getMediaFile,
    createMediaFile,
    bulkCreateMediaFiles
}