import { prisma } from "../config/database.js";
import { Prisma } from "@prisma/client";

export const userRepository = {
    findById: (id: string) => prisma.user.findUnique({ where: { id } }),

    findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

    findByUsername: (username: string) =>
        prisma.user.findUnique({ where: { username } }),

    findAll: (excludeUserId?: string, search?: string) =>
        prisma.user.findMany({
            where: {
                ...(excludeUserId && { id: { not: excludeUserId } }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { username: { contains: search, mode: "insensitive" } },
                    ],
                }),
            },
            orderBy: { name: "asc" },
        }),

    create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),

    update: (id: string, data: Prisma.UserUpdateInput) =>
        prisma.user.update({ where: { id }, data }),

    updateOnlineStatus: (id: string, isOnline: boolean) =>
        prisma.user.update({
            where: { id },
            data: {
                isOnline,
                lastActive: isOnline ? undefined : new Date(),
            },
        }),

    delete: (id: string) => prisma.user.delete({ where: { id } }),
};
