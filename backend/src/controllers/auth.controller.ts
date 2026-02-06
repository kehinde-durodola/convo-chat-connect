import { Request, Response, NextFunction } from "express";
import { authenticateWithGoogle, logout } from "../services/auth.service.js";
import { GoogleAuthInput } from "../schemas/auth.schema.js";

export async function googleAuth(
    req: Request<object, object, GoogleAuthInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { idToken } = req.body;
        const result = await authenticateWithGoogle(idToken);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export async function logoutUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await logout(req.user!.id);

        res.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
}

export async function getCurrentUser(
    req: Request,
    res: Response,
    _next: NextFunction
): Promise<void> {
    res.json({
        success: true,
        data: { user: req.user },
    });
}
