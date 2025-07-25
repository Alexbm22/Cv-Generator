
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
    description: string,
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

export interface CVContentAttributes {
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection,
    sectionsOrder: string[];
}

export interface PersonalDataAttributes {
    photo: string | null,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date,
    socialLinks: SocialLink[]
}

export interface CVMetadataAttributes {
    id: string;
    title: string;
    template: CVTemplates;
    updatedAt: number;
    version?: number;
}

export interface PublicCVAttributes extends CVContentAttributes, CVMetadataAttributes, PersonalDataAttributes {}

export interface CVAttributes {
    id: number,
    public_id:string,
    user_id: number,
    version: number;
    title: string,
    template: CVTemplates;
    personalData?: PersonalDataAttributes | null,
    encryptedPersonalData: string
    content: CVContentAttributes,
    createdAt: Date,
    updatedAt: Date
}
