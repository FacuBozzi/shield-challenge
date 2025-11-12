import { Router } from "express";
import { signInSchema } from "../schemas/authSchemas";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/authService";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/signin",
  asyncHandler(async (req, res) => {
    const credentials = signInSchema.parse(req.body);
    const result = await authService.signIn(credentials.email, credentials.password);
    res.status(200).json(result);
  }),
);

router.post(
  "/signout",
  authenticate,
  asyncHandler(async (req, res) => {
    authService.signOut(req.user!.token);
    res.status(200).json({ success: true });
  }),
);

export default router;
