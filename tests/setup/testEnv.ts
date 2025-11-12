import { config } from "dotenv";

const envFile = process.env.TEST_ENV_FILE ?? ".env";
config({ path: envFile });

process.env.JWT_SECRET ??= "test-secret";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.NODE_ENV = "test";

if (!process.env.DATABASE_URL) {
  if (process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  } else {
    throw new Error(
      "DATABASE_URL or TEST_DATABASE_URL must be set before running tests",
    );
  }
}
