import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, DUMMY_HASH } from "@/server/auth/password";
import { hashToken } from "@/server/auth/session";
import { rateLimit, resetRateLimits } from "@/server/security/rateLimit";

describe("passwords", () => {
  it("hashes with a random salt and verifies", async () => {
    const a = await hashPassword("a long passphrase");
    const b = await hashPassword("a long passphrase");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("a long passphrase", a)).toBe(true);
    expect(await verifyPassword("a long passphrasE", a)).toBe(false);
  });
  it("the dummy hash never verifies", async () => {
    expect(await verifyPassword("", DUMMY_HASH)).toBe(false);
  });
  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("x", "plain")).toBe(false);
  });
});

describe("session tokens", () => {
  it("stores only a one-way hash", () => {
    expect(hashToken("abc")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken("abc")).not.toContain("abc");
  });
});

describe("rate limiter", () => {
  it("blocks after the limit within a window", () => {
    resetRateLimits();
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 60_000).ok).toBe(true);
    expect(rateLimit("k", 3, 60_000).ok).toBe(false);
    expect(rateLimit("other", 3, 60_000).ok).toBe(true);
  });
});
