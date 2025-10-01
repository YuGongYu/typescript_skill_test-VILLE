import { z } from 'zod'

// Query Schemas
export const AnswersQuerySchema = z.object({
    isin: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    ids: z.string().optional(),
    user: z.string().optional(),
    limit: z.preprocess(v => Array.isArray(v) ? v[0] : v, z.coerce.number().int().positive().max(100000).optional())
})

// Domain Schemas
export const CompanySchema = z.object({
    standby: z.boolean().optional().default(false),
    title: z.string(),
    tid: z.number(),
    isin: z.string(),
    id: z.number()
})

const QuestionBaseSchema = z.object({
    fullText: z.string(),
    shortText: z.string(),
    tag: z.string(),
    id: z.string(),
    isPublic: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true)
})

export const QuestionSchema = QuestionBaseSchema.extend({
    // Use base schema for partial to avoid infinite recursion on translations
    translations: z.record(z.string(), QuestionBaseSchema.partial()).optional()
})

export const AnswerSchema = z.object({
    value: z.number(),
    source: z.string(),
    created: z.string(),
    skip: z.boolean(),
    id: z.string(),
    user: z.string(),
    company: CompanySchema,
    question: QuestionSchema
})

export const AnswersArraySchema = AnswerSchema.array()

// Exported Types from Schemas
export type AnswersQuery = z.infer<typeof AnswersQuerySchema>
export type Company = z.infer<typeof CompanySchema>
export type Question = z.infer<typeof QuestionSchema>
export type Answer = z.infer<typeof AnswerSchema>


