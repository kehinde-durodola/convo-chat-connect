import { Request, Response, NextFunction } from "express";
import {
    sendMessage,
    markMessageAsRead,
    deleteMessage,
} from "../services/message.service.js";
import { uploadImage } from "../services/cloudinary.service.js";
import {
    SendMessageInput,
    MessageIdParam,
    DeleteMessageQuery,
} from "../schemas/message.schema.js";
import { ConversationIdParam } from "../schemas/conversation.schema.js";

export async function createMessage(
    req: Request<ConversationIdParam, object, SendMessageInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const message = await sendMessage(
            req.params.id,
            req.user!.id,
            req.body.text,
            req.body.imageUrl
        );

        res.status(201).json({
            success: true,
            data: { message },
        });
    } catch (error) {
        next(error);
    }
}

export async function markAsRead(
    req: Request<MessageIdParam>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await markMessageAsRead(req.params.id, req.user!.id);

        res.json({
            success: true,
            message: "Message marked as read",
        });
    } catch (error) {
        next(error);
    }
}

export async function removeMessage(
    req: Request<MessageIdParam, object, object, DeleteMessageQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await deleteMessage(req.params.id, req.user!.id, req.query.for);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export async function uploadMessageImage(
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

        const imageUrl = await uploadImage(req.file, "convo/messages");

        res.json({
            success: true,
            data: { imageUrl },
        });
    } catch (error) {
        next(error);
    }
}
