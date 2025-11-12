import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { walletBodySchema, walletIdParamSchema } from "../schemas/walletSchemas";
import { walletService } from "../services/walletService";
import { unauthorizedError } from "../errors/AppError";

const router = Router();

const getUserId = (tokenSub: string) => {
  const userId = Number(tokenSub);
  if (Number.isNaN(userId)) {
    throw unauthorizedError();
  }
  return userId;
};

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const wallets = await walletService.list(getUserId(req.user!.sub));
    res.json(wallets);
  }),
);

router.post(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const payload = walletBodySchema.parse(req.body);
    const wallet = await walletService.create(getUserId(req.user!.sub), payload);
    res.status(201).json(wallet);
  }),
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = walletIdParamSchema.parse(req.params);
    const wallet = await walletService.getById(getUserId(req.user!.sub), id);
    res.json(wallet);
  }),
);

router.put(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = walletIdParamSchema.parse(req.params);
    const payload = walletBodySchema.parse(req.body);
    const wallet = await walletService.update(getUserId(req.user!.sub), id, payload);
    res.json(wallet);
  }),
);

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = walletIdParamSchema.parse(req.params);
    await walletService.remove(getUserId(req.user!.sub), id);
    res.status(204).send();
  }),
);

export default router;
