-- Rename tables to match @@map configuration without data loss
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Wallet" RENAME TO "wallets";

-- Rename associated sequences
ALTER SEQUENCE "User_id_seq" RENAME TO "users_id_seq";
ALTER SEQUENCE "Wallet_id_seq" RENAME TO "wallets_id_seq";

-- Rename primary key constraints
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";
ALTER TABLE "wallets" RENAME CONSTRAINT "Wallet_pkey" TO "wallets_pkey";

-- Rename foreign key constraint
ALTER TABLE "wallets" RENAME CONSTRAINT "Wallet_userId_fkey" TO "wallets_userId_fkey";

-- Rename indexes
ALTER INDEX "User_email_key" RENAME TO "users_email_key";
ALTER INDEX "Wallet_address_key" RENAME TO "wallets_address_key";
ALTER INDEX "Wallet_userId_idx" RENAME TO "wallets_userId_idx";
