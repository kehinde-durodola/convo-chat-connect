import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/)
        .optional(),
    bio: z.string().max(500).optional(),
    phoneNumber: z.string().max(20).optional(),
});

export const userIdParamSchema = z.object({
    id: z.string().uuid(),
});

export const searchQuerySchema = z.object({
    search: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
