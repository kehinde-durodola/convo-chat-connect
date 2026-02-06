import { Request, Response, NextFunction } from "express";
import { getUserById, getAllUsers, updateProfile, updateAvatar } from "../services/user.service.js";
import { UpdateProfileInput, UserIdParam, SearchQuery } from "../schemas/user.schema.js";

export async function getUsers(
    req: Request<object, object, object, SearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const users = await getAllUsers(req.user!.id, req.query.search);

        res.json({
            success: true,
            data: { users },
        });
    } catch (error) {
        next(error);
    }
}

export async function getUser(
    req: Request<UserIdParam>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = await getUserById(req.params.id);

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUserProfile(
    req: Request<object, object, UpdateProfileInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = await updateProfile(req.user!.id, req.body);

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
}

export async function uploadUserAvatar(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
            return;
        }

        const avatarUrl = await updateAvatar(req.user!.id, req.file);

        res.json({
            success: true,
            data: { avatarUrl },
        });
    } catch (error) {
        next(error);
    }
}
