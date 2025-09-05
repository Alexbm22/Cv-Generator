import { DEFAULT_CV_EDITOR_STATE } from '../../../constants/CV/CVEditor';
import { 
    CVEditStore,
    CVEditStoreMetadataSliceAttributes,
 } from '../../../interfaces/cv';

export const createMetadataSlice = (set: {
        (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
        (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
    }): CVEditStoreMetadataSliceAttributes => ({
    id: '',
    title: DEFAULT_CV_EDITOR_STATE.title,
    jobTitle: DEFAULT_CV_EDITOR_STATE.jobTitle,
    template: DEFAULT_CV_EDITOR_STATE.template,
    updatedAt: DEFAULT_CV_EDITOR_STATE.updatedAt,
    createdAt: DEFAULT_CV_EDITOR_STATE.createdAt,
    UserPhoto: DEFAULT_CV_EDITOR_STATE.UserPhoto,
    UserPreview: DEFAULT_CV_EDITOR_STATE.UserPreview,
    GuestPhoto: DEFAULT_CV_EDITOR_STATE.GuestPhoto,
    GuestPreview: DEFAULT_CV_EDITOR_STATE.GuestPreview,

    setGuestPhoto: (photoURL) => {
        set({ GuestPhoto: photoURL })
    },
    setGuestPreview: (previewURL) => {
        set({ GuestPreview: previewURL })
    },
    setJobTitle: (jobTitle) => set({ jobTitle }),
    setTemplate: (template) => set({ template }),
    setTitle: (title) => set({ title }),
    setSectionsOrder: (sectionsOrder) => set({ sectionsOrder }),
})