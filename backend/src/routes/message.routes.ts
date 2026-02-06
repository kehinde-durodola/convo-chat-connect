import { Router } from "express";
import { markAsRead, removeMessage, uploadMessageImage } from "../controllers/message.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { messageIdParamSchema, deleteMessageQuerySchema } from "../schemas/message.schema.js";

const router = Router();

router.use(authMiddleware);

router.post("/:id/read", validate(messageIdParamSchema, "params"), markAsRead);
router.delete(
    "/:id",
    validate(messageIdParamSchema, "params"),
    validate(deleteMessageQuerySchema, "query"),
    removeMessage
);

export default router;

export const uploadRouter = Router();
uploadRouter.use(authMiddleware);
uploadRouter.post("/image", uploadSingle, uploadMessageImage);
