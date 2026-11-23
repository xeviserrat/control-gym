import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const minute = 60_000;
const day = 24 * 60 * minute;
const recipientSchema = z.string().trim().toLowerCase().max(254).email();
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createInvitation(email: unknown) {
  const sender = await getSessionUser();
  if (!sender) return { status: "unauthenticated" } as const;

  const senderId = sender.id;
  const recipient = recipientSchema.safeParse(email);
  if (!recipient.success) return { status: "invalid_email" } as const;

  return prisma.$transaction(async (tx) => {
    // Serialize quota checks for this sender across requests and app instances.
    const [profile] = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM profiles WHERE id = ${senderId}::uuid FOR NO KEY UPDATE
    `;
    if (!profile) return { status: "unauthenticated" } as const;

    const [{ now }] = await tx.$queryRaw<[{ now: Date }]>`
      SELECT clock_timestamp() AS now
    `;
    const lastDay = new Date(now.getTime() - day);
    const recent = await tx.userInvitation.findMany({
      where: { senderId, createdAt: { gt: lastDay } },
      select: { recipientEmail: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (recent.length >= 10) return { status: "daily_limit" } as const;
    if (recent.some((invitation) =>
      invitation.recipientEmail === recipient.data &&
      invitation.createdAt.getTime() > now.getTime() - 15 * minute
    )) {
      return { status: "recipient_limit" } as const;
    }

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + 7 * day);
    await tx.userInvitation.create({
      data: {
        senderId,
        recipientEmail: recipient.data,
        tokenHash: hashToken(token),
        createdAt: now,
        expiresAt,
      },
    });

    return { status: "created", token, expiresAt } as const;
  }, { isolationLevel: "ReadCommitted" });
}

export async function acceptInvitation(token: string) {
  const account = await getSessionUser();
  if (!account) return { status: "unauthenticated" } as const;
  if (!tokenPattern.test(token)) return { status: "invalid_token" } as const;

  return prisma.$transaction(async (tx) => {
    // Lock first so expiration is checked after any competing acceptance finishes.
    const [invitation] = await tx.$queryRaw<{
      id: string;
      recipientEmail: string;
      acceptedAt: Date | null;
      acceptedById: string | null;
    }[]>`
      SELECT id, recipient_email AS "recipientEmail",
        accepted_at AS "acceptedAt", accepted_by_id AS "acceptedById"
      FROM user_invitations
      WHERE token_hash = ${hashToken(token)}
      FOR UPDATE
    `;
    if (!invitation) return { status: "invalid_token" } as const;
    if (account.email?.trim().toLowerCase() !== invitation.recipientEmail) {
      return { status: "wrong_account" } as const;
    }
    if (!account.email_confirmed_at) return { status: "unverified_email" } as const;

    if (invitation.acceptedAt) {
      return invitation.acceptedById === account.id
        ? { status: "accepted", acceptedAt: invitation.acceptedAt } as const
        : { status: "wrong_account" } as const;
    }

    const [accepted] = await tx.$queryRaw<{ acceptedAt: Date }[]>`
      WITH acceptance_time AS (SELECT clock_timestamp() AS now)
      UPDATE user_invitations
      SET accepted_by_id = ${account.id}::uuid, accepted_at = acceptance_time.now
      FROM acceptance_time
      WHERE id = ${invitation.id}::uuid
        AND accepted_at IS NULL
        AND expires_at > acceptance_time.now
      RETURNING accepted_at AS "acceptedAt"
    `;
    return accepted
      ? { status: "accepted", acceptedAt: accepted.acceptedAt } as const
      : { status: "expired" } as const;
  }, { isolationLevel: "ReadCommitted" });
}
