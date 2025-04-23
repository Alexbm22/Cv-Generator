export interface Language {
    id: string,
    name: string,
    level: ProficiencyLanguageLevel
} 

export interface Skill {
    id: string,
    name: string,
    level: SkillLevel
}

export interface WorkExperience {
    id: string,
    jobTitle: string,
    company: string,
    startDate: Date | null,
    endDate: Date | null,
    description: string
}

export interface Education {
    id: string,
    degree: string,
    institution: string,
    startDate: Date | null,
    endDate: Date | null,
    description: string
}

export interface Project {
    id: string,
    name: string,
    description: string,
    url: string,
    technologies: string[]
}

// to do - adjust the Custom Sections content structure
export interface CustomSection {
    id: string,
    title: string,
    content: {
        title: string,
        description: string
    }[]
}

export interface SocialLink {
    id: string,
    platform: string,
    url: string
}

export enum ProficiencyLanguageLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    FLUENT = 'FLUENT',
    NATIVE = 'NATIVE'
}

export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export interface CVMetadataAttributes {
    id: string | undefined;
    title: string;
    template: string;
    sectionsOrder: string[];
}

// to do - adjust the attributes optional fields
export interface CVContentAttributes {
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection[]
}

export interface CVPersonalInfoAttributes {
    photo: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date | null,
    socialLinks: SocialLink[]
}

export interface CVMetadataActions {
    setTemplate: (template: string) => void;
    setTitle: (title: string) => void;
    setSectionsOrder: (sectionsOrder: string[]) => void;
    setId: (id: string | undefined) => void;
}

export interface CVContentActions {
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

    addCustomSection: (customSection: Partial<CustomSection>) => void;
    removeCustomSection: (id: string) => void;
    updateCustomSection: (id: string, customSection: Partial<CustomSection>) => void;
}

export interface CVPersonalInfoActions {
    setPhoto: (photo: string) => void;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setEmail: (email: string) => void;
    setPhoneNumber: (phoneNumber: string) => void;
    setAddress: (address: string) => void;
    setBirthDate: (birthDate: Date | null) => void;

    addSocialLink: (socialLink: Partial<SocialLink>) => void;
    removeSocialLink: (id: string) => void;
    updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => void;
}


export interface CVStoreActions {
    getCVObject: () => CVAttributes;
    saveCV: () => void;
    setCV: (CV: CVAttributes) => void;
}

export interface CVAttributes extends CVMetadataAttributes, CVContentAttributes, CVPersonalInfoAttributes {}

export interface CVMetadataSliceAttributes extends CVMetadataAttributes, CVMetadataActions {}
export interface CVContentSliceAttributes extends CVContentAttributes, CVContentActions {}
export interface CVPersonalInfoSliceAttributes extends CVPersonalInfoAttributes, CVPersonalInfoActions {}

export interface CVStore extends CVMetadataSliceAttributes, CVContentSliceAttributes, CVPersonalInfoSliceAttributes, CVStoreActions {}