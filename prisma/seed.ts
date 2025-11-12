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
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: await hashPassword(password),
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded user ${user.email} with password ${password}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to seed database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
