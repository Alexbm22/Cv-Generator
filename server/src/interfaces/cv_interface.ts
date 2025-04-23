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

export interface CVContentAttributes {
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection[]
}

export interface PersonalDataAttributes {
    photo: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date | null,
    socialLinks: SocialLink[]
}

export interface CVAttributes {
    id: number,
    title: string,
    userId: number,
    template: string,
    personalData?: PersonalDataAttributes | null,
    encryptedPersonalData: string
    content: CVContentAttributes
    createdAt: Date,
    updatedAt: Date
}