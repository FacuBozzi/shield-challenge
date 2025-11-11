import prisma from "../lib/prisma";
import { env } from "../config/env";
import { signJwt, AuthTokenPayload, verifyJwt } from "../utils/jwt";
import { verifyPassword } from "../utils/password";
import { tokenStore } from "./tokenStore";
import { AppError } from "../errors/AppError";

export const authService = {
  async signIn(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signJwt(
      { sub: String(user.id), email: user.email },
      env.jwtSecret,
      env.jwtExpiresInSeconds,
    );

    return {
      token,
      expiresIn: env.jwtExpiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },

  signOut(token: string) {
    const payload = verifyJwt(token, env.jwtSecret);
    tokenStore.revoke(token, payload.exp);
  },
};
