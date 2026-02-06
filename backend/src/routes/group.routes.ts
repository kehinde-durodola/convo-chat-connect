import { Router } from "express";
import { listGroups, getGroup, joinGroupHandler, leaveGroupHandler } from "../controllers/group.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { searchQuerySchema } from "../schemas/user.schema.js";
import { conversationIdParamSchema } from "../schemas/conversation.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validate(searchQuerySchema, "query"), listGroups);
router.get("/:id", validate(conversationIdParamSchema, "params"), getGroup);
router.post("/:id/join", validate(conversationIdParamSchema, "params"), joinGroupHandler);
router.post("/:id/leave", validate(conversationIdParamSchema, "params"), leaveGroupHandler);

export default router;
