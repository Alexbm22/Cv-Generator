import { DEFAULT_CV_EDITOR_STATE } from '../../../constants/CV/CVEditor';
import { 
    CVEditStore,
    CVMetadataSliceAttributes,
 } from '../../../interfaces/cv';

export const createMetadataSlice = (set: {
        (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
        (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
    }): CVMetadataSliceAttributes => ({
    id: null,
    title: DEFAULT_CV_EDITOR_STATE.title,
    template: DEFAULT_CV_EDITOR_STATE.template,
    sectionsOrder: DEFAULT_CV_EDITOR_STATE.sectionsOrder,
    updatedAt: DEFAULT_CV_EDITOR_STATE.updatedAt,
    version: DEFAULT_CV_EDITOR_STATE.version,

    setTemplate: (template) => set({ template }),
    setTitle: (title) => set({ title }),
    setSectionsOrder: (sectionsOrder) => set({ sectionsOrder }),
    setUpdatedAt: () => set({ updatedAt: new Date().getTime()}),
})