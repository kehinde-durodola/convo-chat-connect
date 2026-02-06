import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";
import logger from "../utils/logger.util.js";
import { env } from "../config/env.js";

interface ErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    stack?: string;
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error(`${req.method} ${req.path}`, {
        error: err.message,
        stack: err.stack,
        requestId: req.requestId,
    });

    const response: ErrorResponse = {
        success: false,
        message: err.message || "Internal server error",
    };

    if (err instanceof ValidationError) {
        response.errors = err.errors;
        res.status(err.statusCode).json(response);
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json(response);
        return;
    }

    if (env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    response.message = "Internal server error";
    res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
}
