import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors.js";

type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const data = schema.parse(req[target]);
            req[target] = data;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join(".");
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });
                next(new ValidationError("Validation failed", errors));
            } else {
                next(error);
            }
        }
    };
}
