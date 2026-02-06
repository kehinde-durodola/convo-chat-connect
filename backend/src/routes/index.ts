import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import conversationRoutes from "./conversation.routes.js";
import messageRoutes, { uploadRouter } from "./message.routes.js";
import groupRoutes from "./group.routes.js";
import { prisma } from "../config/database.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

router.get("/health/ready", async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: "ok",
            database: "connected",
        });
    } catch {
        res.status(503).json({
            status: "error",
            database: "disconnected",
        });
    }
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/groups", groupRoutes);
router.use("/upload", uploadRouter);

export default router;
