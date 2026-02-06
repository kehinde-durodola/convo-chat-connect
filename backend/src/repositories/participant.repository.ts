import { prisma } from "../config/database.js";
import { Prisma } from "@prisma/client";

export const participantRepository = {
    findByUserAndConversation: (userId: string, conversationId: string) =>
        prisma.participant.findUnique({
            where: {
                userId_conversationId: { userId, conversationId },
            },
        }),

    findByConversation: (conversationId: string) =>
        prisma.participant.findMany({
            where: { conversationId },
            include: { user: true },
        }),

    create: (data: Prisma.ParticipantUncheckedCreateInput) =>
        prisma.participant.create({ data }),

    createMany: (data: Prisma.ParticipantUncheckedCreateInput[]) =>
        prisma.participant.createMany({ data }),

    update: (id: string, data: Prisma.ParticipantUpdateInput) =>
        prisma.participant.update({ where: { id }, data }),

    updateByUserAndConversation: (
        userId: string,
        conversationId: string,
        data: Prisma.ParticipantUpdateInput
    ) =>
        prisma.participant.update({
            where: {
                userId_conversationId: { userId, conversationId },
            },
            data,
        }),

    incrementUnreadCount: (conversationId: string, excludeUserId: string) =>
        prisma.participant.updateMany({
            where: {
                conversationId,
                userId: { not: excludeUserId },
            },
            data: {
                unreadCount: { increment: 1 },
            },
        }),

    resetUnreadCount: (userId: string, conversationId: string) =>
        prisma.participant.update({
            where: {
                userId_conversationId: { userId, conversationId },
            },
            data: {
                unreadCount: 0,
                lastReadAt: new Date(),
            },
        }),

    delete: (userId: string, conversationId: string) =>
        prisma.participant.delete({
            where: {
                userId_conversationId: { userId, conversationId },
            },
        }),
};
