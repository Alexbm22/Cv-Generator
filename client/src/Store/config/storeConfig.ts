import { debounce } from 'lodash';
import { StoreApi } from 'zustand';
import { CVStore } from '../../interfaces/cv_interface';

export const storeConfig = {
    middlewareOptions: {
        debouncedCVAutoSave : {
            // to do: type config
            autoSaveCV: debounce((api: StoreApi<CVStore>)=> {
                const { saveCV } = api.getState();
                saveCV();
            }, 3000), // 3 seconds debounce
            excludedActions: ['getCVObject', 'saveCV'], // Actions that should not trigger the auto-save
        }
    }
}