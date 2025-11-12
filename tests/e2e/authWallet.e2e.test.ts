import request from "supertest";
import { describe, expect, beforeEach, afterAll, it } from "vitest";
import app from "../../src/app";
import {
  createTestUser,
  createTestWallet,
  resetDatabase,
  disconnectPrisma,
} from "../setup/testDb";

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const signIn = async (email: string, password: string) => {
  const response = await request(app).post("/signin").send({ email, password });
  return response;
};

const authenticate = async (password = "ChangeMe123!") => {
  const user = await createTestUser({ password });
  const response = await signIn(user.email, password);
  expect(response.status).toBe(200);
  return { user, token: response.body.token };
};

describe("Auth & Wallet E2E", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await disconnectPrisma();
  });

  it("rejects invalid signin payloads", async () => {
    const response = await request(app).post("/signin").send({
      email: "invalid-email",
      password: "short",
    });
    expect(response.status).toBe(400);
  });

  it("fails signin with wrong credentials", async () => {
    const user = await createTestUser();
    const response = await signIn(user.email, "WrongPass123!");
    expect(response.status).toBe(401);
  });

  it("signs in a valid user and returns a token", async () => {
    const user = await createTestUser();
    const response = await signIn(user.email, "ChangeMe123!");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(user.email);
  });

  it("prevents access to protected routes without a token", async () => {
    const response = await request(app).get("/wallets");
    expect(response.status).toBe(401);
  });

  it("allows a user to manage their wallets end-to-end", async () => {
    const { token } = await authenticate();

    const createResponse = await request(app)
      .post("/wallets")
      .set(authHeader(token))
      .send({
        tag: "Personal",
        chain: "Ethereum",
        address: "0x1234567890abcdef1234",
      });
    expect(createResponse.status).toBe(201);
    const walletId = createResponse.body.id;

    const listResponse = await request(app).get("/wallets").set(authHeader(token));
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const getResponse = await request(app)
      .get(`/wallets/${walletId}`)
      .set(authHeader(token));
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.tag).toBe("Personal");

    const updateResponse = await request(app)
      .put(`/wallets/${walletId}`)
      .set(authHeader(token))
      .send({
        tag: "Updated",
        chain: "Ethereum",
        address: "0x1234567890abcdef1234",
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.tag).toBe("Updated");

    const deleteResponse = await request(app)
      .delete(`/wallets/${walletId}`)
      .set(authHeader(token));
    expect(deleteResponse.status).toBe(204);

    const finalList = await request(app).get("/wallets").set(authHeader(token));
    expect(finalList.body).toHaveLength(0);
  });

  it("prevents one user from reading or mutating another user's wallet", async () => {
    const { user: owner } = await authenticate();
    const ownerWallet = await createTestWallet({ userId: owner.id });

    const { token: intruderToken } = await authenticate();

    const readResponse = await request(app)
      .get(`/wallets/${ownerWallet.id}`)
      .set(authHeader(intruderToken));
    expect(readResponse.status).toBe(404);

    const updateResponse = await request(app)
      .put(`/wallets/${ownerWallet.id}`)
      .set(authHeader(intruderToken))
      .send({
        tag: "Hacked",
        chain: ownerWallet.chain,
        address: ownerWallet.address,
      });
    expect(updateResponse.status).toBe(404);

    const deleteResponse = await request(app)
      .delete(`/wallets/${ownerWallet.id}`)
      .set(authHeader(intruderToken));
    expect(deleteResponse.status).toBe(404);
  });

  it("prevents two users from sharing the same wallet address", async () => {
    const { token: firstToken } = await authenticate();
    const address = "0xabcdefabcdefabcdef12";

    const firstCreate = await request(app)
      .post("/wallets")
      .set(authHeader(firstToken))
      .send({
        tag: "Owner-1",
        chain: "Ethereum",
        address,
      });
    expect(firstCreate.status).toBe(201);

    const { token: secondToken } = await authenticate();
    const secondCreate = await request(app)
      .post("/wallets")
      .set(authHeader(secondToken))
      .send({
        tag: "Owner-2",
        chain: "Ethereum",
        address,
      });
    expect(secondCreate.status).toBe(409);

    // ensure first user's wallet unaffected
    const list = await request(app).get("/wallets").set(authHeader(firstToken));
    expect(list.body).toHaveLength(1);
    expect(list.body[0].address).toBe(address);
  });

  it("invalidates tokens after sign out", async () => {
    const { token } = await authenticate();

    const signOutResponse = await request(app)
      .post("/signout")
      .set(authHeader(token));
    expect(signOutResponse.status).toBe(200);

    const followUp = await request(app).get("/wallets").set(authHeader(token));
    expect(followUp.status).toBe(401);
  });

  it("does not leak wallets between users", async () => {
    const { user: owner } = await authenticate();
    await createTestWallet({ userId: owner.id, tag: "Owner wallet" });

    const { token: otherToken } = await authenticate();
    const listResponse = await request(app).get("/wallets").set(authHeader(otherToken));
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(0);
  });
});
