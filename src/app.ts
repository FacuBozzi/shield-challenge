import express from "express";
import authRoutes from "./routes/authRoutes";
import walletRoutes from "./routes/walletRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/", authRoutes);
app.use("/wallets", walletRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
