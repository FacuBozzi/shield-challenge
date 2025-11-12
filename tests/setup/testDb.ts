import { randomUUID } from "crypto";
import prisma from "../../src/lib/prisma";
import { hashPassword } from "../../src/utils/password";

export type TestUserOptions = {
  email?: string;
  password?: string;
};

export type TestWalletOptions = {
  userId: number;
  tag?: string | null;
  chain?: string;
  address?: string;
};

export const resetDatabase = async () => {
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
};

export const createTestUser = async (options: TestUserOptions = {}) => {
  const email = options.email ?? `user-${randomUUID()}@example.com`;
  const password = options.password ?? "ChangeMe123!";
  return prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
    },
  });
};

export const createTestWallet = async (options: TestWalletOptions) => {
  const chain = options.chain ?? "Ethereum";
  const address = options.address ?? `0x${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  return prisma.wallet.create({
    data: {
      tag: options.tag ?? "Test wallet",
      chain,
      address,
      userId: options.userId,
    },
  });
};

export const disconnectPrisma = () => prisma.$disconnect();
