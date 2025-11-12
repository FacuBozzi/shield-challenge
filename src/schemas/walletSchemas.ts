import { z } from "zod";

export const walletBodySchema = z.object({
  tag: z.string().min(1).max(50).optional(),
  chain: z.string().min(2).max(100),
  address: z.string().min(10).max(200),
});

export const walletIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type WalletBodyInput = z.infer<typeof walletBodySchema>;
