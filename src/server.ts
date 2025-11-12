import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  console.log(`API ready on port ${env.port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
