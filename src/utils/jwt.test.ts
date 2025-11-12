import { describe, expect, it } from "vitest";
import { signJwt, verifyJwt } from "./jwt";

describe("jwt utils", () => {
  it("creates and verifies tokens", () => {
    const token = signJwt({ sub: "1", email: "user@example.com" }, "secret", 60);
    const payload = verifyJwt(token, "secret");
    expect(payload.email).toBe("user@example.com");
    expect(payload.sub).toBe("1");
  });

  it("throws when signature is invalid", () => {
    const token = signJwt({ sub: "1", email: "user@example.com" }, "secret", 60);
    expect(() => verifyJwt(token, "wrong-secret")).toThrow("Invalid token signature");
  });
});
