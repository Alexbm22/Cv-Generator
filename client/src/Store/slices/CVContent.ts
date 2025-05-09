import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { 
    CVContentSliceAttributes, 
    CVStore,
    Language, 
    ProficiencyLanguageLevel,
    Skill,
    WorkExperience,
    SkillLevel, 
    Education, 
    CustomSection,
    Project
} from '../../interfaces/cv_interface'; // Adjust the import path as necessary
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export const createContentSlice = (set: {
    (partial: CVStore | Partial<CVStore> | ((state: CVStore) => CVStore | Partial<CVStore>), replace?: false): void;
    (state: CVStore | ((state: CVStore) => CVStore), replace: true): void;
}): CVContentSliceAttributes => ({
    professionalSummary: '',
    languages: [],
    skills: [],
    workExperience: [],
    education: [],
    projects: [],
    customSections: [],

    setProfessionalSummary: (summary: string) => set({professionalSummary: sanitizeHtml(summary)}),

    addLanguage: (language: Partial<Language>) => {
        const newLanguage: Language = {
            id: language.id || uuidv4(),
            name: language.name || '',
            level: language.level || ProficiencyLanguageLevel.INTERMEDIATE
        }

        return set((state: CVContentSliceAttributes) => ({
            languages: state.languages.concat(newLanguage)
        }))
    },
    removeLanguage: (id: string) => set((state: CVContentSliceAttributes) => ({
        languages: state.languages.filter((lang) => lang.id !== id)
    })),
    updateLanguage: (id: string, language: Partial<Language>) => set((state: CVContentSliceAttributes) => ({
        languages: state.languages.map((lang) => lang.id === id ? { ...lang, ...language} : lang)
    })),

    addSkill: (skill: Partial<Skill>) => {
        const newSkill: Skill = {
            id: skill.id || uuidv4(),
            name: skill.name || '',
            level: skill.level || SkillLevel.INTERMEDIATE
        }

        return set((state: CVContentSliceAttributes) => ({
            skills: state.skills.concat(newSkill)
        }))
    },
    removeSkill: (id: string) => set((state: CVContentSliceAttributes) => ({
        skills: state.skills.filter((skill) => skill.id !== id)
    })),
    updateSkill: (id: string, skill: Partial<Skill>) => set((state: CVContentSliceAttributes) => ({
        skills: state.skills.map((sk) => sk.id === id ? { ...sk, ...skill} : sk)
    })),

    addWorkExperience: (workExperience: Partial<WorkExperience>) => {
        const newWorkExperience: WorkExperience = {
            id: workExperience.id || uuidv4(),
            jobTitle: workExperience.jobTitle || 'Untitled',
            company: workExperience.company || '',
            startDate: workExperience.startDate || new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), // Default to one month ago
            endDate: workExperience.endDate || new Date(),
            description: workExperience.description || ''
        }

        return set((state: CVContentSliceAttributes) => ({
            workExperience: state.workExperience.concat(newWorkExperience).sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            )
        }))
    },
    removeWorkExperience: (id: string) => set((state: CVContentSliceAttributes) => ({
        workExperience: state.workExperience.filter((work) => work.id !== id)
    })),
    updateWorkExperience: (id: string, workExperience: Partial<WorkExperience>) => set((state: CVContentSliceAttributes) => ({
        workExperience: state.workExperience.map((work) => work.id === id ? { ...work, ...workExperience} : work).sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
    })),    

    addEducation: (education: Partial<Education>) => {
        const newEducation: Education = {
            id: education.id || uuidv4(),
            institution: education.institution || 'Untitled',
            degree: education.degree || '',
            startDate: education.startDate || null,
            endDate: education.endDate || null,
            description: education.description || ''
        }

        return set((state: CVContentSliceAttributes) => ({
            education: state.education.concat(newEducation)
        }))
    },
    removeEducation: (id: string) => set((state: CVContentSliceAttributes) => ({
        education: state.education.filter((edu) => edu.id !== id)
    })),
    updateEducation: (id: string, education: Partial<Education>) => set((state: CVContentSliceAttributes) => ({
        education: state.education.map((edu) => edu.id === id ? { ...edu, ...education} : edu)
    })),

    addProject: (project: Partial<Project>) => {
        const newProject: Project = {
            id: project.id || uuidv4(),
            name: project.name || '',
            description: project.description || '',
            url: project.url || '',
            technologies: project.technologies || []
        }

        return set((state: CVContentSliceAttributes) => ({
            projects: state.projects.concat(newProject)
        }))
    },
    removeProject: (id: string) => set((state: CVContentSliceAttributes) => ({
        projects: state.projects.filter((proj) => proj.id !== id)
    })),
    updateProject: (id: string, project: Partial<Project>) => set((state: CVContentSliceAttributes) => ({
        projects: state.projects.map((proj) => proj.id === id ? { ...proj, ...project} : proj)
    })),

    addCustomSection: (section: Partial<CustomSection>) => {
        const newSection: CustomSection = {
            id: section.id || uuidv4(),
            title: section.title || '',
            content: section.content || []
        }

        return set((state: CVContentSliceAttributes) => ({
            customSections: state.customSections.concat(newSection)
        }))
    },
    removeCustomSection: (id: string) => set((state: CVContentSliceAttributes) => ({
        customSections: state.customSections.filter((section) => section.id !== id)
    })),
    updateCustomSection: (id: string, section: Partial<CustomSection>) => set((state: CVContentSliceAttributes) => ({
        customSections: state.customSections.map((sec) => sec.id === id ? { ...sec, ...section} : sec)
    }))
})