import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password utils", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("ChangeMe123!");
    expect(hash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
    const isValid = await verifyPassword("ChangeMe123!", hash);
    expect(isValid).toBe(true);
  });

  it("fails verification with wrong password", async () => {
    const hash = await hashPassword("ChangeMe123!");
    const isValid = await verifyPassword("WrongPassword!", hash);
    expect(isValid).toBe(false);
  });
});
