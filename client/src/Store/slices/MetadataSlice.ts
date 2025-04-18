import { v4 as uuidv4 } from 'uuid';

export const createMetadataSlice = (set: any) => ({
    id: '',
    title: 'Untitled',
    template: 'castor',
    sectionsOrder: [],
    setId: (id: string | null) => set({ id: id || uuidv4() }),
    setTemplate: (template: string) => set({ template }),
    setTitle: (title: string) => set({ title }),
    setSectionsOrder: (sectionsOrder: string[]) => set({ sectionsOrder }),
})