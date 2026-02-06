import { z } from "zod";

export const sendMessageSchema = z
    .object({
        text: z.string().max(5000).optional(),
        imageUrl: z.string().url().optional(),
    })
    .refine((data) => data.text || data.imageUrl, {
        message: "Either text or imageUrl is required",
    });

export const messageIdParamSchema = z.object({
    id: z.string().uuid(),
});

export const deleteMessageQuerySchema = z.object({
    for: z.enum(["self", "everyone"]),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageIdParam = z.infer<typeof messageIdParamSchema>;
export type DeleteMessageQuery = z.infer<typeof deleteMessageQuerySchema>;
