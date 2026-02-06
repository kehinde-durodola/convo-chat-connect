import { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import { userRepository } from "../repositories/user.repository.js";
import { setOnlineStatus } from "../services/user.service.js";
import { getIO } from "../config/socket.js";
import logger from "../utils/logger.util.js";

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

const connectedUsers = new Map<string, string>();

export async function handleConnection(socket: AuthenticatedSocket): Promise<void> {
    const token = socket.handshake.auth.token as string;

    if (!token) {
        socket.disconnect();
        return;
    }

    try {
        const payload = verifyToken(token);
        const user = await userRepository.findById(payload.userId);

        if (!user) {
            socket.disconnect();
            return;
        }

        socket.userId = user.id;
        connectedUsers.set(user.id, socket.id);

        await setOnlineStatus(user.id, true);
        socket.join(`user:${user.id}`);

        socket.broadcast.emit("user:online", { userId: user.id });

        logger.info("User connected", { userId: user.id, socketId: socket.id });

        socket.on("conversation:join", (data: { conversationId: string }) => {
            socket.join(`conversation:${data.conversationId}`);
            logger.debug("User joined conversation", { userId: user.id, conversationId: data.conversationId });
        });

        socket.on("conversation:leave", (data: { conversationId: string }) => {
            socket.leave(`conversation:${data.conversationId}`);
            logger.debug("User left conversation", { userId: user.id, conversationId: data.conversationId });
        });

        socket.on("typing:start", (data: { conversationId: string }) => {
            socket.to(`conversation:${data.conversationId}`).emit("typing", {
                conversationId: data.conversationId,
                userId: user.id,
                isTyping: true,
            });
        });

        socket.on("typing:stop", (data: { conversationId: string }) => {
            socket.to(`conversation:${data.conversationId}`).emit("typing", {
                conversationId: data.conversationId,
                userId: user.id,
                isTyping: false,
            });
        });

        socket.on("disconnect", async () => {
            connectedUsers.delete(user.id);
            await setOnlineStatus(user.id, false);

            const updatedUser = await userRepository.findById(user.id);
            socket.broadcast.emit("user:offline", {
                userId: user.id,
                lastActive: updatedUser?.lastActive,
            });

            logger.info("User disconnected", { userId: user.id });
        });
    } catch (error) {
        logger.error("Socket authentication failed", { error });
        socket.disconnect();
    }
}

export function emitToUser(userId: string, event: string, data: unknown): void {
    getIO().to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: unknown): void {
    getIO().to(`conversation:${conversationId}`).emit(event, data);
}

export function isUserOnline(userId: string): boolean {
    return connectedUsers.has(userId);
}
