import { Prisma } from "../../generated/prisma/client";
import prisma from "../lib/prisma";
import { conflictError, notFoundError } from "../errors/AppError";

export type WalletInput = {
  tag?: string | null;
  chain: string;
  address: string;
};

const handlePrismaError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw conflictError("Wallet address already exists");
  }
  throw error instanceof Error ? error : new Error("Unknown database error");
};

const ensureWallet = async (userId: number, walletId: number) => {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });
  if (!wallet) {
    throw notFoundError("Wallet not found");
  }
  return wallet;
};

export const walletService = {
  list(userId: number) {
    return prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(userId: number, data: WalletInput) {
    return prisma.wallet
      .create({
        data: {
          ...data,
          userId,
        },
      })
      .catch(handlePrismaError);
  },

  getById(userId: number, walletId: number) {
    return ensureWallet(userId, walletId);
  },

  async update(userId: number, walletId: number, data: WalletInput) {
    await ensureWallet(userId, walletId);
    return prisma.wallet
      .update({
        where: { id: walletId },
        data,
      })
      .catch(handlePrismaError);
  },

  async remove(userId: number, walletId: number) {
    await ensureWallet(userId, walletId);
    await prisma.wallet.delete({ where: { id: walletId } });
  },
};
