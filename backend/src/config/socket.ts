import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./env.js";

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: env.FRONTEND_URL,
            credentials: true,
        },
    });

    return io;
}

export function getIO(): Server {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}
