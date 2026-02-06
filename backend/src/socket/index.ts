import { Server as HttpServer } from "http";
import { initializeSocket } from "../config/socket.js";
import { handleConnection } from "./handlers.js";
import logger from "../utils/logger.util.js";

export function setupSocket(httpServer: HttpServer): void {
    const io = initializeSocket(httpServer);

    io.on("connection", handleConnection);

    logger.info("Socket.io initialized");
}

export { emitToUser, emitToConversation, isUserOnline } from "./handlers.js";
