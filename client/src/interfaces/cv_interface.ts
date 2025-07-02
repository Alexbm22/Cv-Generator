import React from "react"

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


export interface CVMetadataAttributes {
    id: string;
    title: string;
    template: CVTemplates;
    sectionsOrder: string[];
    updatedAt: number | null;
    version: number | null;
}

export interface CVContentAttributes {
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection
}

export interface CVPersonalInfoAttributes {
    photo: string | null,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date,
    socialLinks: SocialLink[]
}

export interface CVMetadataActions {
    setTemplate: (template: CVTemplates) => void;
    setTitle: (title: string) => void;
    setSectionsOrder: (sectionsOrder: string[]) => void;
    setUpdatedAt: (time: number) => void;
}

export interface CVContentActions {
    setProfessionalSummary: (summary: string) => void;

    addLanguage: (language: Partial<Language>) => void;
    removeLanguage: (id: string) => void;
    updateLanguage: (id: string, language: Partial<Language>) => void;
    
    addSkill: (skill: Partial<Skill>) => void;
    removeSkill: (id: string) => void;
    updateSkill: (id: string, skill: Partial<Skill>) => void;
    
    addWorkExperience: (workExperience: Partial<WorkExperience>) => void;
    removeWorkExperience: (id: string) => void;
    updateWorkExperience: (id: string, workExperience: Partial<WorkExperience>) => void;

    addEducation: (education: Partial<Education>) => void;
    removeEducation: (id: string) => void;
    updateEducation: (id: string, education: Partial<Education>) => void;

    addProject: (project: Partial<Project>) => void;
    removeProject: (id: string) => void;
    updateProject: (id: string, project: Partial<Project>) => void;

    setCustomSectionTitle: (title: string) => void;
    addCustomSectionAttributes: (customSection: Partial<CustomSectionAttributes>) => void;
    removeCustomSectionAttributes: (id: string) => void;
    updateCustomSectionAttributes: (id: string, customSection: Partial<CustomSectionAttributes>) => void;
}

export interface CVPersonalInfoActions {
    setPhoto: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setEmail: (email: string) => void;
    setPhoneNumber: (phoneNumber: string) => void;
    setAddress: (address: string) => void;
    setBirthDate: (birthDate: Date) => void;

    addSocialLink: (socialLink: Partial<SocialLink>) => void;
    removeSocialLink: (id: string) => void;
    updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => void;
}

export interface CVEditStoreActions {
    getCVObject: () => CVAttributes;
    saveCV: () => void;
    setCV: (CV: CVAttributes) => void;
}

export interface CVAttributes extends CVMetadataAttributes, CVContentAttributes, CVPersonalInfoAttributes {}

export interface CVMetadataSliceAttributes extends CVMetadataAttributes, CVMetadataActions {}
export interface CVContentSliceAttributes extends CVContentAttributes, CVContentActions {}
export interface CVPersonalInfoSliceAttributes extends CVPersonalInfoAttributes, CVPersonalInfoActions {}

export interface CVEditStore extends CVMetadataSliceAttributes, CVContentSliceAttributes, CVPersonalInfoSliceAttributes, CVEditStoreActions {}

export interface CVStore {
    CVs: CVAttributes[];
    lastSynced: number | null;
    dbHydrated: boolean;
    setLastSynced: (time: number) => void;
    isSyncStale: () => boolean;
    getChangedCVs: () => CVAttributes[];
    setdbHydrated: (dbHydrated: boolean) => void;
    setFetchedCVs: (CVs: CVAttributes[]) => void;
    addCV: (CV: CVAttributes) => void;
    removeCV: (id: string) => void;
    updateCV: (updatedCV: CVAttributes) => void;
    setCVs: (CVs: CVAttributes[]) => void;
}