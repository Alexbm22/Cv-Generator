import { 
    CVEditStore,
    CVMetadataSliceAttributes,
    CVTemplates,
 } from '../../../interfaces/cv';

export const createMetadataSlice = (set: {
        (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
        (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
    }): CVMetadataSliceAttributes => ({
    id: '',
    title: 'Untitled',
    template: CVTemplates.CASTOR,
    sectionsOrder: [],
    updatedAt: null,
    version: null,

    setTemplate: (template: CVTemplates) => set({ template }),
    setTitle: (title: string) => set({ title }),
    setSectionsOrder: (sectionsOrder: string[]) => set({ sectionsOrder }),
    setUpdatedAt: () => set({ updatedAt: new Date().getTime()}),
})