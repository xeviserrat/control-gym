CREATE TABLE "user_invitations" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "sender_id" UUID NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "accepted_by_id" UUID,
    "accepted_at" TIMESTAMPTZ(3),

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_invitations_sender_id_fkey"
        FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_invitations_acceptance_check"
        CHECK (("accepted_by_id" IS NULL) = ("accepted_at" IS NULL))
);

CREATE UNIQUE INDEX "user_invitations_token_hash_key" ON "user_invitations"("token_hash");
CREATE INDEX "user_invitations_sender_id_created_at_idx" ON "user_invitations"("sender_id", "created_at");

ALTER TABLE "user_invitations" ENABLE ROW LEVEL SECURITY;
