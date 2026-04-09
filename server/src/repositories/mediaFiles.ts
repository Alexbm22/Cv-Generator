import { MediaFilesCreationAttributes, OwnerType } from "@/interfaces/mediaFiles";
import { MediaFiles } from "../models";

const getMediaFile = async (public_id: string) => {
    return await MediaFiles.findOne({
        where: { public_id }
    });
}

const getMediaFileById = async (id: number) => {
    return await MediaFiles.findByPk(id);
}

const createMediaFile = async (mediaFile: MediaFilesCreationAttributes) => {
    return await MediaFiles.create(mediaFile);
}

const bulkCreateMediaFiles = async (mediaFiles: MediaFilesCreationAttributes[]) => {
    return await MediaFiles.bulkCreate(mediaFiles);
}

const deleteOwnerMediaFiles = async (owner_id: number, owner_type: OwnerType) => {
    return await MediaFiles.destroy({
        where: { owner_id, owner_type },
        individualHooks: true
    });
}

const updateMediaFile = async (id: number, updates: Partial<MediaFilesCreationAttributes>) => {
    return await MediaFiles.update(updates, {
        where: { id },
        returning: true
    });
}

export default {
    getMediaFile,
    getMediaFileById,
    createMediaFile,
    bulkCreateMediaFiles,
    deleteOwnerMediaFiles,
    updateMediaFile
}