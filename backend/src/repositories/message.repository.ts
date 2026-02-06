import { prisma } from "../config/database.js";
import { DeletedFor, MessageStatus, Prisma } from "@prisma/client";

export const messageRepository = {
    findById: (id: string) =>
        prisma.message.findUnique({
            where: { id },
            include: { sender: true },
        }),

    findByConversation: (
        conversationId: string,
        limit: number = 50,
        cursor?: string
    ) =>
        prisma.message.findMany({
            where: {
                conversationId,
                deletedAt: null,
            },
            include: { sender: true },
            orderBy: { createdAt: "desc" },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
        }),

    create: (data: Prisma.MessageUncheckedCreateInput) =>
        prisma.message.create({
            data,
            include: { sender: true },
        }),

    updateStatus: (id: string, status: MessageStatus) =>
        prisma.message.update({
            where: { id },
            data: { status },
        }),

    markAsRead: (conversationId: string, userId: string) =>
        prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                status: MessageStatus.sent,
            },
            data: { status: MessageStatus.read },
        }),

    softDelete: (id: string, deletedFor: DeletedFor) =>
        prisma.message.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedFor,
            },
        }),

    delete: (id: string) => prisma.message.delete({ where: { id } }),
};
