import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');

export const createExperienceSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters long'),
    date: z.coerce.date(),
    description: z.string().min(2, 'Description must be at least 2 characters long'),
    imageUrl: z.string().url('imageUrl must be a valid URL').optional(),
  }),
});

export const updateExperienceSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    date: z.coerce.date().optional(),
    description: z.string().min(2).optional(),
    imageUrl: z.string().url('imageUrl must be a valid URL').optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});

export const getExperienceByIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>['body'];
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>['body'];
