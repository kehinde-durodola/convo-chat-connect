import { Request, Response, NextFunction } from "express";
import {
    getUserConversations,
    getConversationById,
    createDirectConversation,
    muteConversation,
} from "../services/conversation.service.js";
import { getMessages } from "../services/message.service.js";
import {
    CreateConversationInput,
    ConversationIdParam,
    ConversationQuery,
    MuteConversationInput,
} from "../schemas/conversation.schema.js";

export async function getConversations(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const conversations = await getUserConversations(req.user!.id);

        res.json({
            success: true,
            data: { conversations },
        });
    } catch (error) {
        next(error);
    }
}

export async function getConversation(
    req: Request<ConversationIdParam, object, object, ConversationQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const conversation = await getConversationById(req.params.id, req.user!.id);
        const messages = await getMessages(
            req.params.id,
            req.user!.id,
            req.query.limit,
            req.query.cursor
        );

        res.json({
            success: true,
            data: {
                conversation,
                messages: messages.messages,
                nextCursor: messages.nextCursor,
                hasMore: messages.hasMore,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function createConversation(
    req: Request<object, object, CreateConversationInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await createDirectConversation(req.user!.id, req.body.userId);

        res.status(result.created ? 201 : 200).json({
            success: true,
            data: {
                conversation: result.conversation,
                created: result.created,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function updateConversationMute(
    req: Request<ConversationIdParam, object, MuteConversationInput>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await muteConversation(req.user!.id, req.params.id, req.body.isMuted);

        res.json({
            success: true,
            message: req.body.isMuted ? "Conversation muted" : "Conversation unmuted",
        });
    } catch (error) {
        next(error);
    }
}
