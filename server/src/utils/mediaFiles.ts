import { MediaFilesCreationAttributes, MediaType, MimeType, OwnerType } from "@/interfaces/mediaFiles";

const generateS3ObjKey = (
    owner_type: OwnerType,
    owner_id: number,
    type: MediaType,
    filename: string,
    mime_type: MimeType
): string => {
    // safe filename
    const safeFilename = filename.replace(/\s+/g, "_").toLowerCase();

    // generate unique suffix
    const uniqueId = Date.now();

    return `myapp/${
        owner_type
    }/${
        owner_id
    }/${
        type
    }_${
        safeFilename
    }_${
        uniqueId
    }.${
        mime_type.split('/')[1]
    }`;
}

const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export {
    generateS3ObjKey,
    isValidImageUrl
}