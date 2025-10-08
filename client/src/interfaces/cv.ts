import { MediaFilesAttributes } from "./mediaFiles"

export interface Language {
    id: string,
    name: string,
    level: ProficiencyLanguageLevel | null
} 

export interface Skill {
    id: string,
    name: string,
    level: SkillLevel | null
}

export interface WorkExperience {
    id: string,
    jobTitle: string,
    company: string,
    startDate: Date,
    endDate: Date,
    description: string
}

export interface Education {
    id: string,
    degree: string,
    institution: string,
    startDate: Date,
    endDate: Date,
    description: string
}

export interface Project {
    id: string,
    name: string,
    url: string,
    description: string,
    startDate: Date,
    endDate: Date,
}

export interface CustomSectionAttributes {
    id: string,
    title: string,
    startDate: Date,
    endDate: Date,
    description: string,
}

export interface CustomSection {
    title: string,
    content: CustomSectionAttributes[]
}

export interface SocialLink {
    id: string,
    platform: string,
    url: string
}

export enum ProficiencyLanguageLevel {
    A1 = 'A1 - Beginner',
    A2 = 'A2 - Elementary',
    B1 = 'B1 - Intermediate',
    B2 = 'B2 - Upper Intermediate',
    C1 = 'C1 - Advanced',
    C2 = 'C2 - Proficient'
}

export enum SkillLevel {
    BEGINNER = 'Begginer',
    INTERMEDIATE = 'Intermediate',
    ADVANCED = 'Advanced',
    EXPERT = 'Expert'
}

export enum CVTemplates {
    CASTOR = 'castor',
}

export type ModifiedCVAttributes = Omit<UserCVAttributes, 'photo' | 'preview' > & {
  photo: string;
};

export type TemplateComponentProps = {
    CV: ModifiedCVAttributes
}

export interface CVMetadataAttributes {
    id: string;
    title: string;
    jobTitle: string;
    template: CVTemplates;
    updatedAt: Date;
    createdAt: Date
}

export interface UserCVMetadataAttributes extends CVMetadataAttributes {
    photo?: MediaFilesAttributes;
    preview?: MediaFilesAttributes;
}

export interface GuestCVMetadataAttributes extends CVMetadataAttributes {
    photo: string | null;
    preview: string | null;
}

export interface CVEditStoreMetadataAttributes extends CVMetadataAttributes {
    UserPreview?: MediaFilesAttributes;
    UserPhoto?: MediaFilesAttributes;
    GuestPreview: string | null;
    GuestPhoto: string | null;
}

export interface CVContentAttributes {
    sectionsOrder: string[];
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection
}

export interface CVPersonalInfoAttributes {
    photo_last_uploaded?: Date,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date,
    socialLinks: SocialLink[]
}

export interface CVEditStoreMetadataActions {
    setTemplate: (template: CVTemplates) => void;
    setTitle: (title: string) => void;
    setJobTitle: (jobTitle: string) => void;
    setSectionsOrder: (sectionsOrder: string[]) => void;
    setGuestPhoto: (photoURL: string | null) => void;
    setGuestPreview: (previewURL: string | null) => void;
}

export interface CVEditStoreContentActions {
    setProfessionalSummary: (summary: string) => void;

    addLanguage: () => void;
    removeLanguage: (id: string) => void;
    updateLanguage: (id: string, language: Partial<Language>) => void;
    
    addSkill: () => void;
    removeSkill: (id: string) => void;
    updateSkill: (id: string, skill: Partial<Skill>) => void;
    
    addWorkExperience: () => void;
    removeWorkExperience: (id: string) => void;
    updateWorkExperience: (id: string, workExperience: Partial<WorkExperience>) => void;

    addEducation: () => void;
    removeEducation: (id: string) => void;
    updateEducation: (id: string, education: Partial<Education>) => void;

    addProject: () => void;
    removeProject: (id: string) => void;
    updateProject: (id: string, project: Partial<Project>) => void;

    setCustomSectionTitle: (title: string) => void;
    addCustomSectionAttributes: () => void;
    removeCustomSectionAttributes: (id: string) => void;
    updateCustomSectionAttributes: (id: string, customSection: Partial<CustomSectionAttributes>) => void;
}

export interface CVEditStorePersonalInfoActions {
    setPhotoLastUploaded: (date: Date) => void;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setEmail: (email: string) => void;
    setPhoneNumber: (phoneNumber: string) => void;
    setAddress: (address: string) => void;
    setBirthDate: (birthDate: Date) => void;

    addSocialLink: () => void;
    removeSocialLink: (id: string) => void;
    updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => void;
}

export interface CVEditStoreActions {
    getUserCVObject: () => UserCVAttributes;
    setUserCV: (CV: UserCVAttributes) => void;

    getGuestCVObject: () => GuestCVAttributes;
    setGuestCV: (CV: GuestCVAttributes) => void;
}

export interface UserCVAttributes extends 
UserCVMetadataAttributes, CVContentAttributes, CVPersonalInfoAttributes {}

export interface GuestCVAttributes extends 
GuestCVMetadataAttributes, CVContentAttributes, CVPersonalInfoAttributes {}

export interface CVEditStoreMetadataSliceAttributes extends 
CVEditStoreMetadataAttributes, CVEditStoreMetadataActions {}

export interface CVEditStoreContentSliceAttributes extends 
CVContentAttributes, CVEditStoreContentActions {}

export interface CVEditStorePersonalInfoSliceAttributes extends 
CVPersonalInfoAttributes, CVEditStorePersonalInfoActions {}

export interface CVEditStoreObjectAttributes extends
CVEditStoreMetadataAttributes, CVPersonalInfoAttributes, CVContentAttributes {}

export interface CVEditStore extends 
CVEditStoreMetadataSliceAttributes, CVEditStoreContentSliceAttributes, CVEditStorePersonalInfoSliceAttributes, CVEditStoreActions {}

export enum CVStateMode {
    USER = 'user',
    GUEST = 'guest'
}

export type CVState = 
    { mode: CVStateMode.USER, cvs: UserCVMetadataAttributes[], selectedCV: UserCVAttributes | null, _hasHydrated: null} | 
    { mode: CVStateMode.GUEST, cvs: GuestCVAttributes[], selectedCV: GuestCVAttributes | null, _hasHydrated: boolean } 

export interface CVsStore {
    CVState: CVState;
    setHydrationState: (hydrationState: boolean) => void;
    updateGuestCV: (CV: GuestCVAttributes) => void;
    findGuestCV: (id:string) => GuestCVAttributes | undefined
    setGuestSelectedCV: (CV:GuestCVAttributes) => void;
    setUserSelectedCV: (CV:UserCVAttributes) => void;
    clearCVsData: () => void;
    addUserCV: (CV: UserCVMetadataAttributes) => void;
    addGuestCV: (CV: GuestCVAttributes) => void;
    removeCV: (id: string) => void;
    setUserCVs: (CVs: UserCVMetadataAttributes[]) => void;
    setGuestCVs: (CVs: GuestCVAttributes[]) => void;
    migrateGuestToUser: (cvs?: UserCVMetadataAttributes[]) => void;
    migrateUserToGuest: (cvs?: GuestCVAttributes[]) => void;
}