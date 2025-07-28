import { 
    CVEditStore,
    CVMetadataSliceAttributes,
    CVTemplates,
 } from '../../../interfaces/cv';

export const createMetadataSlice = (set: {
        (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
        (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
    }): CVMetadataSliceAttributes => ({
    id: null,
    title: 'Untitled',
    template: CVTemplates.CASTOR,
    sectionsOrder: [],
    updatedAt: null,
    version: null,

    setTemplate: (template) => set({ template }),
    setTitle: (title) => set({ title }),
    setSectionsOrder: (sectionsOrder) => set({ sectionsOrder }),
    setUpdatedAt: () => set({ updatedAt: new Date().getTime()}),
})