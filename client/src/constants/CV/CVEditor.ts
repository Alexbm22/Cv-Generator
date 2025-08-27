import { CVTemplates, Language, ProficiencyLanguageLevel, SkillLevel, SocialLink } from "../../interfaces/cv";

export const CV_EDITOR_FORM_CONSTANTS = {
    sections: {
        personal_infos: {
            title: 'Personal Information',
            fields: {
                title: {
                    label: 'CV Title:',
                    type: 'text',
                    placeholder: 'e.g. Your CV Title',
                },
                job_title: {
                    label: 'Job Title:',
                    type: 'text',
                    placeholder: 'e.g. Engineer',
                },
                photo: {
                    label: '+ Add Photo',
                    type: 'file',
                    accept: 'image/*',
                },
                first_name: {
                    label: 'First Name:',
                    type: 'text',
                    placeholder: 'e.g. John',
                },
                last_name: {
                    label: 'Last Name:',
                    type: 'text',
                    placeholder: 'e.g. Doe',
                },
                email: {
                    label: 'Email:',
                    type: 'email',
                    placeholder: 'e.g. john.doe@gmail.com',
                },
                phone_number: {
                    label: 'Phone Number:',
                    type: 'tel',
                    placeholder: 'e.g. (+33) 6 1234 5678',
                },
                address: {
                    label: 'Address:',
                    type: 'text',
                    placeholder: 'e.g. 123 St, City, Country',
                },
                birth_date: {
                    label: 'Birth Date:',
                    type: 'date',
                    placeholder: '',
                },
                social_links: {
                    title: 'Social Links',
                    description: 'Add your social media links (e.g. LinkedIn, GitHub, etc.)',
                    add_button_text: '+ Add Link',
                    fields: {
                        platform: {
                            label: 'Platform:',
                            placeholder: 'e.g. LinkedIn',
                        },
                        url: {
                            label: 'URL:',
                            placeholder: 'e.g. https://linkedin.com/johndoe',
                        },
                    },
                },
            },
        },
        professional_summary: {
            title: 'Professional Summary',
            description: 'Write a brief summary about yourself and your career goals.',
            placeholder: 'Write a brief summary about yourself, your skills, and your career goals. This is your chance to make a strong first impression on potential employers.',
        },
        work_experience: {
            title: 'Work Experience',
            description: 'Add your work experience, including job titles, companies, and dates.',
            add_button_text: '+ Add Work Experience',
            fields: {
                job_title: {
                    label: 'Job Title:',
                    placeholder: 'e.g. Software Engineer',
                },
                company_name: {
                    label: 'Company Name:',
                    placeholder: 'e.g. ABC Corp',
                },
                start_date: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                end_date: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                description: {
                    label: 'Description:',
                    placeholder: 'Describe your responsibilities and achievements in this role.',
                },
            },
        },
        education: {
            title: 'Education',
            description: 'Indicate the exact title of the degree or training, specifying if obtained and the distinction (most recent only).',
            add_button_text: '+ Add Education',
            fields: {
                degree: {
                    label: 'Degree:',
                    placeholder: 'e.g. Bachelor of Science in Computer Science',
                },
                institution: {
                    label: 'Institution:',
                    placeholder: 'Institution Name',
                },
                start_date: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                end_date: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                section_description: 'Write a brief description of your studies and any relevant projects or achievements.',
            },
        },
        skills: {
            title: 'Skills',
            description: 'List your skills and proficiencies.',
            add_button_text: '+ Add Skill',
            fields: {
                skill: {
                    label: 'Skill:',
                    placeholder: 'e.g. JavaScript, Python, etc.',
                },
            },
        },
        languages: {
            title: 'Languages',
            description: 'List the languages you speak and your proficiency level.',
            add_button_text: '+ Add Language',
            fields: {
                language: {
                    label: 'Language:',
                    placeholder: 'e.g. English',
                },
            },
        },
        projects: {
            title: 'Projects',
            description: 'Indicate the exact title of the project, specifying if completed and any relevant details (most recent only).',
            add_button_text: '+ Add Project',
            fields: {
                project_name: {
                    label: 'Project Name:',
                    placeholder: 'e.g. Personal Website',
                },
                url: {
                    label: 'URL:',
                    placeholder: 'e.g. https://personal-website.com',
                },
                start_date: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                end_date: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                description: {
                    label: 'Description:',
                    placeholder: 'Describe the project and your role in it.',
                },
                technologies_used: {
                    label: 'Technologies Used:',
                    placeholder: 'e.g. React, Node.js, etc.',
                },
            },
        },
        custom_section: {
            title: 'Custom Section',
            section_title_placeholder: 'Add a Title',
            description: 'Indicate the exact title of the degree or training, specifying if obtained and the distinction (most recent only).',
            add_button_text: '+ Add Entry',
            fields: {
                title: {
                    label: 'Title:',
                    placeholder: 'e.g. My Custom Section Title',
                },
                start_date: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                end_date: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                description: {
                    label: 'Description:',
                    placeholder: 'Write a brief description of your studies and any relevant projects or achievements.',
                },
            },
        },
    },
};

export const CV_EDITOR_TEMPLATE_CONSTANTS = {
    sections: {
        about_me: {
            title: 'About Me',
            default: 'Results-driven and detail-oriented professional with a strong background in [Your Field, e.g., software development, project management, data analysis, etc.]. Proven ability to deliver high-quality results in fast-paced, deadline-driven environments. Skilled in [mention key skills, e.g., full-stack development, team collaboration, problem-solving], with a passion for continuous learning and improvement. Adept at working both independently and as part of a team to achieve organizational goals and drive innovation.',
        },
        personal_infos: {
            default: {
                phone_number: '0123456789',
                email: 'john.doe@example.com',
                address: '123 Main St, Anytown, USA',
            },
        },
        social_links: {
            title: 'Social Links',
            default: [
                {
                    platform: 'LinkedIn',
                    url: 'linkedin.com/in/your-profile',
                },
                {
                    platform: 'GitHub',
                    url: 'github.com/your-username',
                },
            ] as SocialLink[],
        },
        skills: {
            title: 'Skills',
            default: [
                { name: 'JavaScript', level: SkillLevel.EXPERT },
                { name: 'React', level: SkillLevel.INTERMEDIATE },
                { name: 'Node.js', level: SkillLevel.INTERMEDIATE },
            ],
        },
        languages: {
            title: 'Languages',
            default: [
                { name: 'English', level: ProficiencyLanguageLevel.B2 },
                { name: 'French', level: ProficiencyLanguageLevel.A2 },
            ] as Language[],
        },
        work_experience: {
            title: 'Work Experience',
            default: [
                {
                    job_title: 'Software Engineer',
                    company_name: 'Tech Solutions Inc.',
                    start_date: '2022-01-01',
                    end_date: '2024-06-30',
                    description: 'Developed and maintained full-stack applications using React and Node.js. Led a team of 3 developers and implemented CI/CD pipelines.',
                },
            ],
        },
        education: {
            title: 'Education',
            default: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Technology',
                    start_date: '2018-09-01',
                    end_date: '2022-06-30',
                    section_description: 'Focused on software engineering, algorithms, and database systems.',
                },
            ],
        },
        projects: {
            title: 'Projects',
            default: [
                {
                    project_name: 'Personal Portfolio',
                    url: 'https://yourportfolio.com',
                    start_date: '2023-01-01',
                    end_date: '2023-03-01',
                    description: 'Built a personal portfolio using React and TailwindCSS.',
                    technologies_used: 'React, TailwindCSS, Vite',
                },
            ],
        },
        custom_section: {
            title: 'Certifications',
            default: [
                {
                    title: 'AWS Certified Developer – Associate',
                    start_date: '2023-05-01',
                    end_date: '',
                    description: 'Validated skills in developing and deploying applications on AWS infrastructure.',
                },
            ],
        },
    },
};

export const DEFAULT_CV_EDITOR_STATE = {
    title: 'Untitled',
    jobTitle: '',
    template: CVTemplates.CASTOR,
    professionalSummary: '',
    sectionsOrder: [],
    languages: [],
    skills: [],
    workExperience: [],
    education: [],
    projects: [],
    customSections: {
        title: '',
        content: []
    },
    photo: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthDate: new Date(),
    socialLinks: [],
}