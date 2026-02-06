import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { setupSocket } from "./socket/index.js";
import logger from "./utils/logger.util.js";

const httpServer = createServer(app);

setupSocket(httpServer);

async function startServer(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info("Database connected");

        httpServer.listen(env.PORT, () => {
            logger.info(`Server running on port ${env.PORT}`);
            logger.info(`Environment: ${env.NODE_ENV}`);
            logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
        });
    } catch (error) {
        logger.error("Failed to start server", { error });
        process.exit(1);
    }
}

process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await prisma.$disconnect();
    httpServer.close(() => {
        logger.info("Server closed");
        process.exit(0);
    });
});

process.on("SIGINT", async () => {
    logger.info("SIGINT received, shutting down gracefully");
    await prisma.$disconnect();
    httpServer.close(() => {
        logger.info("Server closed");
        process.exit(0);
    });
});

startServer();
