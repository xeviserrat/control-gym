"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { acceptInvitation, createInvitation } from "@/lib/invitations/invitations";
import { invitationAuthHref, invitationCookieName, invitationDestination, invitationPath } from "@/lib/invitations/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export async function createInvitationAction(email: string) {
  const result = await createInvitation(email);
  if (result.status !== "created") return result;
  return {
    status: "created",
    url: new URL(`${invitationPath}/${result.token}`, await getSiteUrl()).href,
    expiresAt: result.expiresAt,
  } as const;
}

export async function acceptInvitationAction(reference: string) {
  const destination = invitationDestination(reference);
  if (!destination) redirect(invitationPath);
  const token = (await cookies()).get(invitationCookieName(reference))?.value;
  if (token) await acceptInvitation(token);
  redirect(destination);
}

export async function changeInvitationAccountAction(reference: string) {
  const destination = invitationDestination(reference);
  if (!destination) redirect(invitationPath);
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  redirect(error ? destination : invitationAuthHref("/login", reference));
}
