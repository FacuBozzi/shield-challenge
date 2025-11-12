import { describe, expect, it } from "vitest";
import { credentialsSchema } from "../../src/schemas/authSchemas";

describe("credentialsSchema", () => {
  it("accepts valid email and password", () => {
    const result = credentialsSchema.safeParse({
      email: "User@example.com",
      password: "ChangeMe123!",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects invalid emails", () => {
    const cases = ["bad-email", "user@", "user@example", "user@@example.com"];
    for (const email of cases) {
      const result = credentialsSchema.safeParse({
        email,
        password: "ChangeMe123!",
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects short passwords", () => {
    const result = credentialsSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
