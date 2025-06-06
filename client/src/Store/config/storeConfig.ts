import { debounce } from 'lodash';
import { StoreApi } from 'zustand';
import { CVStore, SyncState } from '../../interfaces/cv_interface';
import { useSyncCV } from '../../hooks/useCV';
import { useEffect } from 'react';

export const storeConfig = {
    middlewareOptions: {
        debouncedCVAutoSave : {
            // to do: type config
            autoSaveCV: debounce((api: StoreApi<CVStore>)=> {
                const { saveCV, setSyncState, getCVObject } = api.getState();
                const { mutate, isSuccess, isError, isPending } = useSyncCV()

                saveCV(); // saving the CV to the main user cv list

                useEffect(() => {
                    if(isPending) setSyncState(SyncState.SYNCING)
                    if(isSuccess) setSyncState(SyncState.SYNCED)
                    if(isError) setSyncState(SyncState.ERROR)
                }, [isSuccess, isError, isPending])

                mutate(getCVObject())

            }, 1000), // 3 seconds debounce
            excludedActions: ['getCVObject', 'saveCV'], // Actions that should not trigger the auto-save
        }
    }
}