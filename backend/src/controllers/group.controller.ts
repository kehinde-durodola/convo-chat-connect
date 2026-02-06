import { Request, Response, NextFunction } from "express";
import { getGroups, getGroupDetails, joinGroup, leaveGroup } from "../services/group.service.js";
import { SearchQuery } from "../schemas/user.schema.js";
import { ConversationIdParam } from "../schemas/conversation.schema.js";

export async function listGroups(
    req: Request<object, object, object, SearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const groups = await getGroups(req.user!.id, req.query.search);

        res.json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
}

export async function getGroup(
    req: Request<ConversationIdParam>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const group = await getGroupDetails(req.params.id);

        res.json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
}

export async function joinGroupHandler(
    req: Request<ConversationIdParam>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const group = await joinGroup(req.params.id, req.user!.id);

        res.json({
            success: true,
            data: { conversation: group },
        });
    } catch (error) {
        next(error);
    }
}

export async function leaveGroupHandler(
    req: Request<ConversationIdParam>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await leaveGroup(req.params.id, req.user!.id);

        res.json({
            success: true,
            message: "Left group successfully",
        });
    } catch (error) {
        next(error);
    }
}
