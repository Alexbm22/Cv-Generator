import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
    CVStoreAttributes,
} from '../interfaces/cv_interface';
import  {
    createMetadataSlice,
    createContentSlice,
    createPersonalInfoSlice,
} from './slices';

export const useCvStore = create<CVStoreAttributes>()(
    devtools(
        (set): CVStoreAttributes => ({
            ...createMetadataSlice(set),
            ...createContentSlice(set),
            ...createPersonalInfoSlice(set),
        }),{
            name: 'cv-store',
        }
    )
)