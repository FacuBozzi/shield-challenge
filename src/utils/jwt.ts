import { createHmac, timingSafeEqual } from "crypto";

type Header = {
  alg: "HS256";
  typ: "JWT";
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

const base64UrlEncode = (value: string) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const encode = (data: unknown) => base64UrlEncode(JSON.stringify(data));

export const signJwt = (
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
  secret: string,
  expiresInSeconds: number,
) => {
  const header: Header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const tokenPayload: AuthTokenPayload = { ...payload, iat, exp };
  const encodedHeader = encode(header);
  const encodedPayload = encode(tokenPayload);
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyJwt = (token: string, secret: string): AuthTokenPayload => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const providedSignature = Buffer.from(signature, "base64url");

  if (providedSignature.length !== expectedSignature.length) {
    throw new Error("Invalid token signature");
  }

  if (!timingSafeEqual(providedSignature, expectedSignature)) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthTokenPayload;
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return payload;
};
