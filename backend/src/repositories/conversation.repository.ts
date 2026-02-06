import { prisma } from "../config/database.js";
import { ConversationType, Prisma } from "@prisma/client";

export const conversationRepository = {
    findById: (id: string) =>
        prisma.conversation.findUnique({
            where: { id },
            include: {
                participants: {
                    include: { user: true },
                },
            },
        }),

    findDirectConversation: (userId1: string, userId2: string) =>
        prisma.conversation.findFirst({
            where: {
                type: ConversationType.direct,
                AND: [
                    { participants: { some: { userId: userId1 } } },
                    { participants: { some: { userId: userId2 } } },
                ],
            },
            include: {
                participants: {
                    include: { user: true },
                },
            },
        }),

    findUserConversations: (userId: string) =>
        prisma.conversation.findMany({
            where: {
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: { user: true },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
        }),

    findGroups: (userId: string, search?: string) =>
        prisma.conversation.findMany({
            where: {
                type: ConversationType.group,
                ...(search && { name: { contains: search, mode: "insensitive" } }),
            },
            include: {
                participants: {
                    where: { userId },
                },
                _count: {
                    select: { participants: true },
                },
            },
        }),

    create: (data: Prisma.ConversationCreateInput) =>
        prisma.conversation.create({
            data,
            include: {
                participants: {
                    include: { user: true },
                },
            },
        }),

    update: (id: string, data: Prisma.ConversationUpdateInput) =>
        prisma.conversation.update({ where: { id }, data }),

    updateTimestamp: (id: string) =>
        prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() },
        }),

    delete: (id: string) => prisma.conversation.delete({ where: { id } }),
};
