import { CVSectionTypes } from '@/interfaces/cv';
import { z } from 'zod';
import { GuestCVSchema, sectionDataSchema } from './cv_validators';

export const historyEntrySchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(4000),
});


export const UpdateItemOpSchema = z.object({
  operationType: z.literal('update_item'),
  sectionType: z.enum(CVSectionTypes),
  itemId: z.uuidv4(),
  newValue: z.string().max(5000),
  originalValue: z.string().max(5000),
})

export const AddItemOpSchema = z.object({
  operationType: z.literal('add_item'),
  sectionType: z.enum(CVSectionTypes),
  newValue: z.string().max(5000),
})

export const RemoveItemOpSchema = z.object({
  operationType: z.literal('remove_item'),
  sectionType: z.enum(CVSectionTypes),
  itemId: z.uuidv4(),
})

export const SetFieldOpSchema = z.object({
  operationType: z.literal('set_field'),
  field: z.string().min(1).max(100),
  newValue: z.string().max(5000),
  originalValue: z.string().max(5000),
})

export const SetCustomSectionTitleOpSchema = z.object({
  operationType: z.literal('set_custom_section_title'),
  value: z.string().max(200),
})

export const SetAboutMeOpSchema = z.object({
  operationType: z.literal('set_about_me'),
  newValue: z.string().max(5000),
  originalValue: z.string().max(5000),
});

export const CVEditOperationSchema = z.discriminatedUnion('operationType', [
  UpdateItemOpSchema,
  AddItemOpSchema,
  RemoveItemOpSchema,
  SetFieldOpSchema,
  SetCustomSectionTitleOpSchema,
  SetAboutMeOpSchema,
]);

export const aiGuestRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(historyEntrySchema).max(50),
  sectionData: sectionDataSchema.optional(),
  cvData: GuestCVSchema.optional(),
  pendingOperation: UpdateItemOpSchema.optional(),
  pendingOperations: z.array(CVEditOperationSchema).optional(),
});

export const aiProtectedRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(historyEntrySchema).max(50),
  CVId: z.uuidv4(),
  pendingOperations: z.array(CVEditOperationSchema).optional(),
  pendingOperation: UpdateItemOpSchema.optional(),
  SectionData: z.object({
    contentId: z.uuidv4(),
    sectionType: z.enum(CVSectionTypes),
  }).optional()
});

export const aiSectionEditResponseSchema = z.object({
  ItemEditOperation: UpdateItemOpSchema,
  message: z.string().min(1).max(5000),
});

export const aiCVEditResponseSchema = z.object({
  CVEditOperations: z.array(CVEditOperationSchema),
  message: z.string().min(1).max(5000),
});

// ── About Me ──────────────────────────────────────────────────────────────────

const pendingTextChangeSchema = z.object({
  original: z.string().max(5000),
  proposed: z.string().max(5000),
});

export const aiAboutMeProtectedRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(historyEntrySchema).max(50),
  CVId: z.uuidv4(),
  pendingTextChange: pendingTextChangeSchema.optional(),
});

export const aiAboutMeGuestRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(historyEntrySchema).max(50),
  currentText: z.string().max(5000),
  pendingTextChange: pendingTextChangeSchema.optional(),
});

export const aiAboutMeResponseSchema = z.object({
  setAboutMe: SetAboutMeOpSchema,
  message: z.string().min(1).max(5000),
});

export type AiRequestInput = z.infer<typeof aiProtectedRequestSchema>;
export type SectionDataInput = z.infer<typeof sectionDataSchema>;
export type AiSectionEditResponseOutput = z.infer<typeof aiSectionEditResponseSchema>;
export type AiCVEditResponseOutput = z.infer<typeof aiCVEditResponseSchema>;
export type CVEditOperation = z.infer<typeof CVEditOperationSchema>;
export type AiAboutMeResponseOutput = z.infer<typeof aiAboutMeResponseSchema>;
