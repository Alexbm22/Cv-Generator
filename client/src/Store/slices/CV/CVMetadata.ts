import { v4 as uuidv4 } from 'uuid';
import { 
    CVStore,
    CVMetadataSliceAttributes,
    CVTemplates,
    SyncState,
 } from '../../../interfaces/cv_interface';

export const createMetadataSlice = (set: {
        (partial: CVStore | Partial<CVStore> | ((state: CVStore) => CVStore | Partial<CVStore>), replace?: false): void;
        (state: CVStore | ((state: CVStore) => CVStore), replace: true): void;
    }): CVMetadataSliceAttributes => ({
    id: '',
    title: 'Untitled',
    template: CVTemplates.CASTOR,
    sectionsOrder: [],

    setId: (id: string | undefined) => set({ id: id || uuidv4() }),
    setTemplate: (template: CVTemplates) => set({ template }),
    setTitle: (title: string) => set({ title }),
    setSectionsOrder: (sectionsOrder: string[]) => set({ sectionsOrder }),
})