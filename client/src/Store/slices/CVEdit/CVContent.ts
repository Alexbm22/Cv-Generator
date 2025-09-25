import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { 
    CVEditStoreContentSliceAttributes, 
    CVEditStore,
    Language, 
    Skill,
    WorkExperience,
    Education, 
    Project,
    CustomSectionAttributes
} from '../../../interfaces/cv'; // Adjust the import path as necessary
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { DEFAULT_CV_EDITOR_STATE } from '../../../constants/CV/CVEditor';

export const createContentSlice = (set: {
    (partial: CVEditStore | Partial<CVEditStore> | ((state: CVEditStore) => CVEditStore | Partial<CVEditStore>), replace?: false): void;
    (state: CVEditStore | ((state: CVEditStore) => CVEditStore), replace: true): void;
}): CVEditStoreContentSliceAttributes => ({
    professionalSummary: DEFAULT_CV_EDITOR_STATE.professionalSummary,
    languages: DEFAULT_CV_EDITOR_STATE.languages,
    skills: DEFAULT_CV_EDITOR_STATE.skills,
    workExperience: DEFAULT_CV_EDITOR_STATE.workExperience,
    education: DEFAULT_CV_EDITOR_STATE.education,
    projects: DEFAULT_CV_EDITOR_STATE.projects,
    customSections: DEFAULT_CV_EDITOR_STATE.customSections,
    sectionsOrder: [],

    setProfessionalSummary: (summary: string) => set({professionalSummary: sanitizeHtml(summary)}),

    addLanguage: () => {
        const newLanguage: Language = {
            id: uuidv4(),
            name: '',
            level: null
        }

        return set((state: CVEditStoreContentSliceAttributes) => ({
            languages: state.languages.concat(newLanguage)
        }))
    },
    removeLanguage: (id: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        languages: state.languages.filter((lang) => lang.id !== id)
    })),
    updateLanguage: (id: string, language: Partial<Language>) => set((state: CVEditStoreContentSliceAttributes) => ({
        languages: state.languages.map((lang) => lang.id === id ? { ...lang, ...language} : lang)
    })),

    addSkill: () => {
        const newSkill: Skill = {
            id: uuidv4(),
            name: '',
            level: null
        }

        return set((state: CVEditStoreContentSliceAttributes) => ({
            skills: state.skills.concat(newSkill)
        }))
    },
    removeSkill: (id: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        skills: state.skills.filter((skill) => skill.id !== id)
    })),
    updateSkill: (id: string, skill: Partial<Skill>) => set((state: CVEditStoreContentSliceAttributes) => ({
        skills: state.skills.map((sk) => sk.id === id ? { ...sk, ...skill} : sk)
    })),

    addWorkExperience: () => {
        const newWorkExperience: WorkExperience = {
            id: uuidv4(),
            jobTitle: 'Untitled',
            company: '',
            startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), // Default to one month ago
            endDate: new Date(),
            description: ''
        }

        return set((state: CVEditStoreContentSliceAttributes) => ({
            workExperience: state.workExperience.concat(newWorkExperience).sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime() // sorting workExperience by startDate
            )
        }))
    },
    removeWorkExperience: (id: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        workExperience: state.workExperience.filter((work) => work.id !== id)
    })),
    updateWorkExperience: (id: string, workExperience: Partial<WorkExperience>) => set((state: CVEditStoreContentSliceAttributes) => ({
        workExperience: state.workExperience.map((work) => work.id === id ? { ...work, ...workExperience} : work).sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
    })),    

    addEducation: () => {
        const newEducation: Education = {
            id: uuidv4(),
            institution: '',
            degree: '',
            startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), // Default to one month ago
            endDate: new Date(),
            description: ''
        }

        return set((state: CVEditStoreContentSliceAttributes) => ({
            education: state.education.concat(newEducation).sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime() // sorting education by startDate
            )
        }))
    },
    removeEducation: (id: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        education: state.education.filter((edu) => edu.id !== id)
    })),
    updateEducation: (id: string, education: Partial<Education>) => set((state: CVEditStoreContentSliceAttributes) => ({
        education: state.education.map((edu) => edu.id === id ? { ...edu, ...education} : edu).sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
    })),

    addProject: () => {
        const newProject: Project = {
            id: uuidv4(),
            name: '',
            url: '',
            startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), // Default to one month ago
            endDate: new Date(),
            description: '',
        }

        return set((state: CVEditStoreContentSliceAttributes) => ({
            projects: state.projects.concat(newProject).sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime() // sorting projects by startDate
            )
        }))
    },
    removeProject: (id: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        projects: state.projects.filter((proj) => proj.id !== id)
    })),
    updateProject: (id: string, project: Partial<Project>) => set((state: CVEditStoreContentSliceAttributes) => ({
        projects: state.projects.map((proj) => proj.id === id ? { ...proj, ...project} : proj).sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
    })),

    // Custom sections
    setCustomSectionTitle: (title: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        customSections: {
            ...state.customSections,
            title: title
        }
    })),
    
    addCustomSectionAttributes: () => {
        const newSection: CustomSectionAttributes = {
            id: uuidv4(), 
            title: '',
            startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30), // Default to one month ago
            endDate: new Date(),
            description: '',
        }

        return set((state: CVEditStoreContentSliceAttributes) => ({
            customSections:{ 
                ...state.customSections,
                content: state.customSections.content.concat(newSection).sort((a, b) =>
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                )
            }
        }))
    },
    removeCustomSectionAttributes: (id: string) => set((state: CVEditStoreContentSliceAttributes) => ({
        customSections: {
            ...state.customSections,
            content: state.customSections.content.filter((section) => section.id !== id)
        }
    })),
    updateCustomSectionAttributes: (id: string, section: Partial<CustomSectionAttributes>) => set((state: CVEditStoreContentSliceAttributes) => ({
        customSections: {
            ...state.customSections,
            content: state.customSections.content.map((sec) => sec.id === id ? { ...sec, ...section} : sec).sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            )
        }
    }))
})