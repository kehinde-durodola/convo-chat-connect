import { z } from "zod";

export const createConversationSchema = z.object({
    userId: z.string().uuid(),
});

export const conversationIdParamSchema = z.object({
    id: z.string().uuid(),
});

export const conversationQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
    cursor: z.string().uuid().optional(),
});

export const muteConversationSchema = z.object({
    isMuted: z.boolean(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>;
export type ConversationQuery = z.infer<typeof conversationQuerySchema>;
export type MuteConversationInput = z.infer<typeof muteConversationSchema>;
