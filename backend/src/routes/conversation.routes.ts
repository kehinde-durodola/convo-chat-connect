import { Router } from "express";
import {
    getConversations,
    getConversation,
    createConversation,
    updateConversationMute,
} from "../controllers/conversation.controller.js";
import { createMessage } from "../controllers/message.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    createConversationSchema,
    conversationIdParamSchema,
    conversationQuerySchema,
    muteConversationSchema,
} from "../schemas/conversation.schema.js";
import { sendMessageSchema } from "../schemas/message.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getConversations);
router.post("/", validate(createConversationSchema), createConversation);
router.get(
    "/:id",
    validate(conversationIdParamSchema, "params"),
    validate(conversationQuerySchema, "query"),
    getConversation
);
router.patch(
    "/:id/mute",
    validate(conversationIdParamSchema, "params"),
    validate(muteConversationSchema),
    updateConversationMute
);
router.post(
    "/:id/messages",
    validate(conversationIdParamSchema, "params"),
    validate(sendMessageSchema),
    createMessage
);

export default router;
