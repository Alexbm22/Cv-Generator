export const CVEditContent = {
    formSections: {
        personalInfos: {
            title: 'Personal Information',
            fields: {
                photo: {
                    label: '+ Add Photo',
                    type: 'file',
                    accept: 'image/*',
                },
                firstName: {
                    label: 'First Name:',
                    type: 'text',
                    placeholder: 'e.g. John',
                },
                lastName: {
                    label: 'Last Name:',
                    type: 'text',
                    placeholder: 'e.g. Doe',
                },
                email: {
                    label: 'Email:',
                    type: 'email',
                    placeholder: 'e.g. john.doe@gmail.com',
                },
                phoneNumber: {
                    label: 'Phone Number:',
                    type: 'tel',
                    placeholder: 'e.g. (+33) 6 1234 5678',
                },
                address: {
                    label: 'Address:',
                    type: 'text',
                    placeholder: 'e.g. 123 St, City, Country',
                },
                birthDate: {
                    label: 'Birth Date:',
                    type: 'date',
                    placeholder: '',
                },
                socialLinks: {
                    title: 'Social Links',
                    description: 'Add your social media links (e.g. LinkedIn, GitHub, etc.)',
                    addText: '+ Add Link',
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
        professionalSummary: {
            title: 'Professional Summary',
            description: 'Write a brief summary about yourself and your career goals.',
            summaryPlaceholder: "Write a brief summary about yourself, your skills, and your career goals. This is your chance to make a strong first impression on potential employers.",
        },
        workExperience: {
            title: 'Work Experience',
            description: 'Add your work experience, including job titles, companies, and dates.',
            addText: '+ Add Work Experience',
            fields: {
                jobTitle: {
                    label: 'Job Title:',
                    placeholder: 'e.g. Software Engineer',
                },
                companyName: {
                    label: 'Company Name:',
                    placeholder: 'e.g. ABC Corp',
                },
                startDate: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                endDate: {
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
            addText: '+ Add Education',
            fields: {
                degree: {
                    label: 'Degree:',
                    placeholder: 'e.g. Bachelor of Science in Computer Science',
                },
                institution: {
                    label: 'Institution:',
                    placeholder: 'Institution Name',
                },
                startDate: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                endDate: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                descriptionPlaceholder: "Write a brief description of your studies and any relevant projects or achievements."
            },
        },
        skills: {
            title: 'Skills',
            description: 'List your skills and proficiencies.',
            addText: '+ Add Skill',
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
            addText: '+ Add Language',
            fields: {
                language: {
                    label: 'Language:',
                    placeholder: 'e.g. English',
                },
            }
        },
        projects: {
            title: 'Projects',
            description: 'Indicate the exact title of the project, specifying if completed and any relevant details (most recent only).',
            addText: '+ Add Project',
            fields: {
                projectName: {
                    label: 'Project Name:',
                    placeholder: 'e.g. Personal Website',
                },
                url: {
                    label: 'URL:',
                    placeholder: 'e.g. https://personal-website.com',
                },
                startDate: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                endDate: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                description: {
                    label: 'Description:',
                    placeholder: 'Describe the project and your role in it.',
                },
                technologiesUsed: {
                    label: 'Technologies Used:',
                    placeholder: 'e.g. React, Node.js, etc.',
                },
            },
        },
        customSection: {
            sectionTitlePlaceholder: 'Add a Title',
            description: "Indicate the exact title of the degree or training, specifying if obtained and the distinction (most recent only).",
            fields: {
                title: {
                    label: 'Title:',
                    placeholder: 'e.g. My Custom Section Title',
                },
                startDate: {
                    label: 'Start Date:',
                    type: 'date',
                    placeholder: '',
                },
                endDate: {
                    label: 'End Date:',
                    type: 'date',
                    placeholder: '',
                },
                description: {
                    label: 'Description:',
                    placeholder: 'Write a brief description of your studies and any relevant projects or achievements.',
                },
            },

        }
    }
}

export const CVPreviewContent = {
    sections: {
        aboutme:{
            title: 'About Me',
            defaultContent: 'Results-driven and detail-oriented professional with a strong background in [Your Field, e.g., software development, project management, data analysis, etc.]. Proven ability to deliver high-quality results in fast-paced, deadline-driven environments. Skilled in [mention key skills, e.g., full-stack development, team collaboration, problem-solving], with a passion for continuous learning and improvement. Adept at working both independently and as part of a team to achieve organizational goals and drive innovation.',
        },
        personalInfos: {
            default: {
                phoneNumber: '0123456789',
                email: 'john.doe@example.com',
                address: '123 Main St, Anytown, USA',
            },
        },
        socialLinks: {
            title: 'Social Links',
            default: {
                platform: 'LinkedIn:',
                url: 'https://www.linkedin.com/in/your-profile',
            },
        },
        skills: {
            title: 'Skills',
        },
        languages: {
            title: 'Languages',
        }
    }
}