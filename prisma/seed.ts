import { PrismaClient } from "../generated/prisma/client";
import { credentialsSchema } from "../src/schemas/authSchemas";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const credentials = credentialsSchema.parse({
  email: process.env.SEED_USER_EMAIL ?? "user@example.com",
  password: process.env.SEED_USER_PASSWORD ?? "ChangeMe123!",
});

const { email, password } = credentials;

async function main() {
  const hashedPassword = await hashPassword(password);

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
    },
  });

  if (existing) {
    console.log(`Updated password for existing user ${user.email}`);
  } else {
    console.log(`Seeded user ${user.email} with password ${password}`);
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
