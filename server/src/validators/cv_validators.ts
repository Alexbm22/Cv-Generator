
import { CVSectionTypes } from '@/interfaces/cv';
import { title } from 'process';
import { z } from 'zod';

export const GuestCVSchema = z.object({
    title: z.string().max(200),
    jobTitle: z.string().max(200),
    template: z.string(),
    templateColor: z.string(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    email: z.string(),
    phoneNumber: z.string().max(20),
    address: z.string().max(300),
    birthDate: z.string(),
    aboutMe: z.string().max(5000),
    languages: z.array(z.object({
        id: z.uuidv4(),
        name: z.string().max(100),
        level: z.string().nullable(),
    })),
    skills: z.array(z.object({
        id: z.uuidv4(),
        name: z.string().max(100),
        level: z.string().nullable(),
    })),
    workExperience: z.array(z.object({
        id: z.uuidv4(),
        jobTitle: z.string().max(200),
        company: z.string().max(200),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string().max(5000),
    })),
    education: z.array(z.object({
        id: z.uuidv4(),
        degree: z.string().max(200),
        institution: z.string().max(200),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string().max(5000),
    })),
    projects: z.array(z.object({
        id: z.uuidv4(),
        name: z.string().max(200),
        url: z.string().max(500),
        description: z.string().max(5000),
        startDate: z.string(),
        endDate: z.string(),
    })),
    customSections: z.object({
        title: z.string().max(200),
        content: z.array(z.object({
            id: z.uuidv4(),
            title: z.string().max(200),
            startDate: z.string(),
            endDate: z.string(),
            description: z.string().max(5000),
        })),    
    }),
    socialLinks: z.array(z.object({
        id: z.uuidv4(),
        platform: z.string().max(100),
        url: z.string().max(500),
    })),
});

export const sectionDataSchema = z.discriminatedUnion('sectionType', [
  z.object({
    sectionType: z.literal('aboutMe'),
    content: z.string().max(5000),
  }),
  z.object({
    sectionType: z.literal('workExperience'),
    contentId: z.uuidv4(),
    content: z.object({
      jobTitle: z.string().max(200),
      company: z.string().max(200),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string().max(5000),
    }),
  }),
  z.object({
    sectionType: z.literal('education'),
    contentId: z.uuidv4(),
    content: z.object({
      degree: z.string().max(200),
      institution: z.string().max(200),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string().max(5000),
    }),
  }),
  z.object({
    sectionType: z.literal('projects'),
    contentId: z.uuidv4(),
    content: z.object({
      name: z.string().max(200),
      url: z.string().max(500),
      description: z.string().max(5000),
      startDate: z.string(),
      endDate: z.string(),
    }),
  }),
  z.object({
    sectionType: z.literal('customSections'),
    contentId: z.uuidv4(),
    content: z.object({
      title: z.string().max(200),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string().max(5000),
    }),
  }),
  z.object({
    sectionType: z.literal('socialLinks'),
    contentId: z.uuidv4(),
    content: z.object({
      platform: z.string().max(100),
      url: z.string().max(500),
    }),
  }),
  z.object({
    sectionType: z.literal('skills'),
    contentId: z.uuidv4(),
    content: z.object({
      name: z.string().max(100),
      level: z.string().nullable(),
    }),
  }),
  z.object({
    sectionType: z.literal('languages'),
    contentId: z.uuidv4(),
    content: z.object({
      name: z.string().max(100),
      level: z.string().nullable(),
    }),
  }),
]);