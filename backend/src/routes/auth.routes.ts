import { Router } from "express";
import { googleAuth, logoutUser, getCurrentUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { googleAuthSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/google", validate(googleAuthSchema), googleAuth);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
