import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { 
    CVStateMode,
    CVsStore,
} from '../interfaces/cv';
import { CVStorage } from '../services/storage/cvIndexedDBStorage';

export const useCVsStore = create<CVsStore>()(
    devtools(
        persist( 
            (set, get) => ({
                CVState: { mode: CVStateMode.GUEST, cvs: [], selectedCV: null, _hasHydrated: false },

                setHydrationState: (hydrationState) => {
                    set(state => (
                        state.CVState.mode === CVStateMode.GUEST ? 
                        {CVState: {
                            ...state.CVState,
                            _hasHydrated: hydrationState
                        }} : state
                    ))
                },
                
                updateGuestCV: (CV) => {
                    set(state => (
                        state.CVState.mode === CVStateMode.GUEST ? 
                        {CVState: {
                            ...state.CVState,
                            cvs: state.CVState.cvs.map(cv => {
                                if(cv.id === CV.id) {
                                    return CV;
                                } else return cv;
                            })
                        }} : state
                    ))
                },

                findGuestCV: (id) => {
                    const { CVState} = get();
                    if(CVState.mode === CVStateMode.GUEST) {
                        return CVState.cvs.find(cv => cv.id === id)
                    } else {
                        throw new Error("This method is only supported in GUEST mode.");
                    }
                },

                setGuestSelectedCV: (CV) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.GUEST ? 
                            { CVState: { ...state.CVState, selectedCV: CV } } :
                            state
                    ))
                },

                setUserSelectedCV: (CV) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.USER ? 
                            { CVState: { ...state.CVState, selectedCV: CV } } :
                            state
                    ))
                },
                
                addUserCV: (CV) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.USER ? 
                            { CVState: { 
                                ...state.CVState, 
                                cvs: state.CVState.cvs.concat(CV) 
                            } 
                            } : state
                    ))
                },

                addGuestCV: (CV) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.GUEST ? 
                            { CVState: { 
                                ...state.CVState, 
                                cvs: state.CVState.cvs.concat(CV) 
                            } 
                            } : state
                    ))
                },

                clearCVsData: () => {
                    // to be improved
                    set((state) => ({
                        CVState: {
                            ...state.CVState,
                            cvs: []
                        }
                    }))
                },
                
                setUserCVs: (CVs) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.USER ? 
                            { CVState: { 
                                ...state.CVState, 
                                cvs: CVs 
                            } 
                            } : state
                    ))
                },
                setGuestCVs: (CVs) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.GUEST ? 
                            { CVState: { 
                                ...state.CVState, 
                                cvs: CVs 
                            } 
                            } : state
                    ))
                },

                removeCV: (id) => {
                    set((state) => (
                        state.CVState.mode === CVStateMode.GUEST ? 
                        {
                            CVState: {
                                ...state.CVState,
                                cvs: state.CVState.cvs.filter((cv) => cv.id !== id)
                            }
                        } : {
                            CVState: {
                                ...state.CVState,
                                cvs: state.CVState.cvs.filter((cv) => cv.id !== id)
                            }
                        }
                    ))
                },

                migrateGuestToUser: (cvs = []) => {
                    set({
                        CVState: {
                            mode: CVStateMode.USER,
                            cvs: cvs,
                            selectedCV: null,
                            _hasHydrated: null
                        }
                    })
                },
                migrateUserToGuest: (cvs = []) => {
                    set({
                        CVState: {
                            mode: CVStateMode.GUEST,
                            cvs: cvs,
                            selectedCV: null,
                            _hasHydrated: true
                        }
                    })
                },

            }),
        {
            name: 'Resumes',
            storage: createJSONStorage(() => CVStorage),
            partialize: (state) => (
                // persist the cvs if the user is a guest
                state.CVState.mode === CVStateMode.GUEST ? 
                {
                    CVState: {
                        ...state.CVState,
                        cvs: state.CVState.cvs,
                        _hasHydrated: false,
                    }
                } : {}
            ),
            onRehydrateStorage: () => (state, error) => {
                if(state && !error) {
                    state.setHydrationState(true);
                }
            },
        }), {
            name: 'CVsStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)