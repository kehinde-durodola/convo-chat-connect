import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import { verifyToken } from "../utils/jwt.js";
import { userRepository } from "../repositories/user.repository.js";
import { UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.util.js";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("No token provided");
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyToken(token);

        const user = await userRepository.findById(payload.userId);
        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        logger.debug("Auth middleware error", { error });
        next(new UnauthorizedError("Invalid or expired token"));
    }
}
