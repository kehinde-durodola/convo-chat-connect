import { Router } from "express";
import { getUsers, getUser, updateUserProfile, uploadUserAvatar } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";
import { updateProfileSchema, userIdParamSchema, searchQuerySchema } from "../schemas/user.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validate(searchQuerySchema, "query"), getUsers);
router.get("/:id", validate(userIdParamSchema, "params"), getUser);
router.patch("/me", validate(updateProfileSchema), updateUserProfile);
router.post("/me/avatar", uploadAvatar, uploadUserAvatar);

export default router;
