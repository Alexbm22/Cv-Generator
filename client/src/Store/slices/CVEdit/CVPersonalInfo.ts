import { 
    CVEditStorePersonalInfoSliceAttributes, 
    SocialLink, 
    CVEditStore } from '../../../interfaces/cv';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { DEFAULT_CV_EDITOR_STATE } from '../../../constants/CV/CVEditor';

export const createPersonalInfoSlice = (set: {
    (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
    (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
}): CVEditStorePersonalInfoSliceAttributes => ({
    photo_last_uploaded: DEFAULT_CV_EDITOR_STATE.photo_last_uploaded,
    firstName: DEFAULT_CV_EDITOR_STATE.firstName,
    lastName: DEFAULT_CV_EDITOR_STATE.lastName,
    email: DEFAULT_CV_EDITOR_STATE.email,
    phoneNumber: DEFAULT_CV_EDITOR_STATE.phoneNumber,
    address: DEFAULT_CV_EDITOR_STATE.address,
    birthDate: DEFAULT_CV_EDITOR_STATE.birthDate,
    socialLinks: DEFAULT_CV_EDITOR_STATE.socialLinks,
    
    setPhotoLastUploaded: (date) => set({ photo_last_uploaded: date }),
    setFirstName: (firstName) => set({ firstName }),
    setLastName: (lastName) => set({ lastName }),
    setEmail: (email) => set({ email }),
    setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
    setAddress: (address) => set({ address }),
    setBirthDate: (birthDate) => set({ birthDate }),

    addSocialLink: () => {
        const newSocialLink: SocialLink = {
            id: uuidv4(),
            platform: '',
            url: '',
        }

        return set((state: CVEditStorePersonalInfoSliceAttributes) => ({
            socialLinks: state.socialLinks.concat(newSocialLink)
        }))
    },
    updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => set((state: CVEditStorePersonalInfoSliceAttributes) => ({
        socialLinks: state.socialLinks.map((link) => link.id === id ? { ...link, ...socialLink} : link)
    })),
    removeSocialLink: (id: string) => set((state: CVEditStorePersonalInfoSliceAttributes) => ({
        socialLinks: state.socialLinks.filter((link) => link.id !== id)
    })),
})