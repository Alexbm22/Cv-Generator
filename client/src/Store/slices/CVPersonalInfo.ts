import { 
    CVPersonalInfoSliceAttributes, 
    SocialLink, 
    CVStore } from '../../interfaces/cv_interface';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { resizeBase64Image } from '../../utils/resizeBase64Image'; 

export const createPersonalInfoSlice = (set: {
    (partial: CVStore | Partial<CVStore> | ((state: CVStore) => CVStore | Partial<CVStore>), replace?: false): void;
    (state: CVStore | ((state: CVStore) => CVStore), replace: true): void;
}): CVPersonalInfoSliceAttributes => ({
    photo: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthDate: new Date(),
    socialLinks: [],
    setPhoto: (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const resizedBase64 = await resizeBase64Image(base64, 1000, 1000, 1);
                set({ photo: resizedBase64 });
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
            };
        }
    },
    setFirstName: (firstName: string) => set({ firstName }),
    setLastName: (lastName: string) => set({ lastName }),
    setEmail: (email: string) => set({ email }),
    setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),
    setAddress: (address: string) => set({ address }),
    setBirthDate: (birthDate: Date) => set({ birthDate }),

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