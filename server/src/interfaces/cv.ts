import { Optional } from "sequelize"
import { PublicMediaFilesAttributes } from "./mediaFiles"
import { CV, MediaFiles } from "@/models"

export interface Language {
    id: string,
    name: string,
    level: ProficiencyLanguageLevel | null
} 

export interface Section {
    id: string,
    isVisible: boolean
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
    POLARIS = 'polaris',
}

export interface CVContentAttributes {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date,
    socialLinks: SocialLink[]
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection,
}


export interface PublicCVContentAttributes {
    photo_last_uploaded: Date | null,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    address: string,
    birthDate: Date,
    socialLinks: SocialLink[]
    professionalSummary: string,
    languages: Language[],
    skills: Skill[],
    workExperience: WorkExperience[],
    education: Education[],
    projects: Project[],
    customSections: CustomSection,
    sectionsOrder: Section[];
}

export interface PublicCVMetadataAttributes {
    id: string;
    title: string;
    jobTitle: string;
    previewId?: string;
    photoId?: string;
    template: CVTemplates;
    templateColor: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PublicCVAttributes extends PublicCVContentAttributes, PublicCVMetadataAttributes {}

export interface ServerCVAttributes {
    id: number,
    public_id: string,
    user_id: number,
    photo_last_uploaded: Date | null,
    jobTitle: string;
    title: string,
    template: CVTemplates;
    templateColor: string;
    sectionsOrder: Section[];
    encryptedContent: string
    content: CVContentAttributes,
    createdAt: Date,
    updatedAt: Date
}

export interface CVWithMediaFiles extends CV {
  mediaFiles: MediaFiles[];
}

export interface CVCreationAttributes extends Optional<
    ServerCVAttributes, 
    'id' | 
    'encryptedContent' | 
    'createdAt' | 
    'updatedAt' | 
    'templateColor'|
    'public_id' | 
    'content' |
    'title' |
    'jobTitle' | 
    'photo_last_uploaded'
> {}
