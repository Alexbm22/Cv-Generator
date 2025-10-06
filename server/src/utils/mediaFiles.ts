import { MediaFilesCreationAttributes } from "@/interfaces/mediaFiles";

const generateS3ObjKey = (
    mediaFileObj: Omit<MediaFilesCreationAttributes, 'obj_key'>
): string => {
    // safe filename
    console.log(mediaFileObj)
    const safeFilename = mediaFileObj.file_name.replace(/\s+/g, "_").toLowerCase();

    // generate unique suffix
    const uniqueId = Date.now();

    return `myapp/
    ${mediaFileObj.owner_type}/
    ${mediaFileObj.owner_id}/
    ${mediaFileObj.type}_${safeFilename}-${uniqueId}`
}

export {
    generateS3ObjKey
}