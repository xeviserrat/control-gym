import { createHash, randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { acceptInvitation, createInvitation } from "./invitations";

vi.mock("@/lib/auth", () => ({ getSessionUser: vi.fn() }));

const session = vi.mocked(getSessionUser);
const recipients = { invited: "invited@example.com", other: "other@example.com" };
const profiles: string[] = [];

function account(id: string, email: string, verified = true): User {
  return {
    id,
    email,
    email_confirmed_at: verified ? new Date().toISOString() : undefined,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };
}

async function invitation() {
  const result = await createInvitation(recipients.invited);
  if (result.status !== "created") throw new Error(result.status);
  return result;
}

// Opt in with a disposable, migrated PostgreSQL database.
describe.runIf(process.env.RUN_INVITATION_POSTGRES_TESTS === "1")("CG-04 against PostgreSQL", () => {
  beforeEach(async () => {
    const id = randomUUID();
    const email = `${id}@example.com`;
    await prisma.profile.create({ data: { id, email } });
    profiles.push(id);
    session.mockResolvedValue(account(id, email));
  });

  afterEach(async () => {
    await prisma.profile.deleteMany({ where: { id: { in: profiles.splice(0) } } });
    session.mockReset();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("requires authentication and validates the email", async () => {
    expect(await createInvitation("bad-email")).toEqual({ status: "invalid_email" });
    session.mockResolvedValue(null);
    expect(await createInvitation(recipients.invited)).toEqual({ status: "unauthenticated" });
    expect(await acceptInvitation("invalid")).toEqual({ status: "unauthenticated" });
    expect(await prisma.userInvitation.count({ where: { senderId: profiles[0] } })).toBe(0);
  });

  it("stores a hash, normalizes the recipient and gives existing and new emails the same result", async () => {
    const existingId = randomUUID();
    const existingEmail = `${existingId}@example.com`;
    await prisma.profile.create({ data: { id: existingId, email: existingEmail } });
    profiles.push(existingId);

    const results = await Promise.all([
      createInvitation(` ${existingEmail.toUpperCase()} `),
      createInvitation(recipients.invited),
    ]);
    const rows = await prisma.userInvitation.findMany({ where: { senderId: profiles[0] } });
    expect(rows).toHaveLength(2);

    for (const [index, email] of [existingEmail, recipients.invited].entries()) {
      const result = results[index];
      if (result.status !== "created") throw new Error(result.status);
      const row = rows.find((entry) => entry.recipientEmail === email);
      expect(row?.tokenHash).toBe(createHash("sha256").update(result.token).digest("hex"));
      expect(row?.expiresAt).toEqual(result.expiresAt);
      expect(row!.expiresAt.getTime() - row!.createdAt.getTime()).toBe(7 * 24 * 60 * 60_000);
      expect(Buffer.from(result.token, "base64url")).toHaveLength(32);
    }
  });

  it("rejects malformed or unknown tokens, wrong accounts and unverified email", async () => {
    const { token } = await invitation();
    session.mockResolvedValue(account(randomUUID(), recipients.other));
    expect(await acceptInvitation("invalid")).toEqual({ status: "invalid_token" });
    expect(await acceptInvitation("A".repeat(43))).toEqual({ status: "invalid_token" });
    expect(await acceptInvitation(token)).toEqual({ status: "wrong_account" });

    session.mockResolvedValue(account(randomUUID(), recipients.invited, false));
    expect(await acceptInvitation(token)).toEqual({ status: "unverified_email" });
    const row = await prisma.userInvitation.findFirstOrThrow({ where: { senderId: profiles[0] } });
    expect(row.acceptedAt).toBeNull();
  });

  it("does not consume an expired invitation", async () => {
    const { token } = await invitation();
    await prisma.userInvitation.updateMany({
      where: { senderId: profiles[0] },
      data: { expiresAt: new Date(0) },
    });
    session.mockResolvedValue(account(randomUUID(), recipients.invited));
    expect(await acceptInvitation(token)).toEqual({ status: "expired" });
    const row = await prisma.userInvitation.findFirstOrThrow({ where: { senderId: profiles[0] } });
    expect(row.acceptedAt).toBeNull();
  });

  it("returns the same confirmation to two concurrent acceptances and only to the accepting ID after expiry", async () => {
    const { token } = await invitation();
    const recipient = account(randomUUID(), recipients.invited.toUpperCase());
    session.mockResolvedValue(recipient);
    const [first, second] = await Promise.all([acceptInvitation(token), acceptInvitation(token)]);
    expect(first).toEqual({ status: "accepted", acceptedAt: expect.any(Date) });
    expect(second).toEqual(first);

    const row = await prisma.userInvitation.findFirstOrThrow({ where: { senderId: profiles[0] } });
    expect(row.acceptedById).toBe(recipient.id);
    expect(first).toEqual({ status: "accepted", acceptedAt: row.acceptedAt });
    await prisma.userInvitation.update({
      where: { id: row.id },
      data: { expiresAt: new Date(0) },
    });
    expect(await acceptInvitation(token)).toEqual(first);
    session.mockResolvedValue(account(randomUUID(), recipients.invited));
    expect(await acceptInvitation(token)).toEqual({ status: "wrong_account" });
  });

  it("limits concurrent creations for the same sender and recipient", async () => {
    const results = await Promise.all(Array.from({ length: 4 }, (_, index) =>
      createInvitation(index % 2 === 0 ? recipients.invited : recipients.invited.toUpperCase()),
    ));
    expect(results.map((result) => result.status).sort()).toEqual([
      "created", "recipient_limit", "recipient_limit", "recipient_limit",
    ]);
    expect(await prisma.userInvitation.count({ where: { senderId: profiles[0] } })).toBe(1);

    await prisma.$executeRaw`
      UPDATE user_invitations SET created_at = clock_timestamp() - interval '15 minutes'
      WHERE sender_id = ${profiles[0]}::uuid
    `;
    expect((await createInvitation(recipients.invited)).status).toBe("created");
  });

  it("does not exceed ten invitations under concurrent creation and uses a rolling day", async () => {
    const results = await Promise.all(Array.from({ length: 14 }, (_, index) =>
      createInvitation(`recipient-${index}@example.com`),
    ));
    expect(results.filter((result) => result.status === "created")).toHaveLength(10);
    expect(results.filter((result) => result.status === "daily_limit")).toHaveLength(4);
    expect(await prisma.userInvitation.count({ where: { senderId: profiles[0] } })).toBe(10);

    await prisma.$executeRaw`
      UPDATE user_invitations SET created_at = clock_timestamp() - interval '24 hours'
      WHERE sender_id = ${profiles[0]}::uuid
    `;
    expect((await createInvitation(recipients.invited)).status).toBe("created");
  });
});
