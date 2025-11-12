import { PrismaClient } from '../generated/prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const email = process.env.SEED_USER_EMAIL ?? 'user@example.com';
const password = process.env.SEED_USER_PASSWORD ?? 'useruser';

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
