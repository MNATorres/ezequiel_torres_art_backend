import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');

export const createArtworkSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters long'),
    description: z.string().min(2, 'Description must be at least 2 characters long'),
    imageUrl: z.string().url('imageUrl must be a valid URL').optional(),
    order: z.number().int().min(0).optional(),
  }),
});

export const updateArtworkSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(2).optional(),
    imageUrl: z.string().url('imageUrl must be a valid URL').optional(),
    order: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: objectId,
  }),
});

export const getArtworkByIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export type CreateArtworkInput = z.infer<typeof createArtworkSchema>['body'];
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>['body'];
