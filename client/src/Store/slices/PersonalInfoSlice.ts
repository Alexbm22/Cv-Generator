import { CVPersonalInfoSliceAttributes, SocialLink } from '../../../interfaces/cv_interface';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export const createPersonalInfoSlice = (set: any) => ({
    photo: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthDate: null,
    socialLinks: [],
    setPhoto: (photo: string) => set({ photo }),
    setFirstName: (firstName: string) => set({ firstName }),
    setLastName: (lastName: string) => set({ lastName }),
    setEmail: (email: string) => set({ email }),
    setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),
    setAddress: (address: string) => set({ address }),
    setBirthDate: (birthDate: Date | null) => set({ birthDate }),

    addSocialLink: (socialLink: Partial<SocialLink>) => {
        const newSocialLink: SocialLink = {
            id: socialLink.id || uuidv4(),
            platform: socialLink.platform || '',
            url: socialLink.url || '',
        }

        return set((state: CVPersonalInfoSliceAttributes) => ({
            socialLinks: state.socialLinks.concat(newSocialLink)
        }))
    },
    updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => set((state: CVPersonalInfoSliceAttributes) => ({
        socialLinks: state.socialLinks.map((link) => link.id === id ? { ...link, ...socialLink} : link)
    })),
    removeSocialLink: (id: string) => set((state: CVPersonalInfoSliceAttributes) => ({
        socialLinks: state.socialLinks.filter((link) => link.id !== id)
    })),
})