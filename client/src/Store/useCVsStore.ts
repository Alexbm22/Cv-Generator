import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { 
    CVStateMode,
    CVsStore,
} from '../interfaces/cv';

export const useCVsStore = create<CVsStore>()(
    devtools(
        persist( 
            (set, get) => ({
                CVState: { mode: CVStateMode.GUEST, cvs: [], selectedCV: null },

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
                            selectedCV: null
                        }
                    })
                },
                migrateUserToGuest: (cvs = []) => {
                    set({
                        CVState: {
                            mode: CVStateMode.GUEST,
                            cvs: cvs,
                            selectedCV: null
                        }
                    })
                },

            }),
        {
            name: 'Resumes',
            partialize: (state) => (
                // persist the cvs if the user is a guest
                state.CVState.mode === CVStateMode.GUEST ? 
                { CVState: state.CVState } : {}
            ),
        }), {
            name: 'CVsStore', // Name of the slice in the Redux DevTools
            enabled: import.meta.env.VITE_NODE_ENV === 'development',
        }
    )
)