import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isInvitationToken } from "@/lib/invitations/invitations";
import {
  invitationCookieName,
  invitationDestination,
  invitationPath,
} from "@/lib/invitations/navigation";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const reference = randomBytes(12).toString("hex");
  const valid = isInvitationToken(token);
  const destination = valid ? invitationDestination(reference)! : invitationPath;
  const url = new URL(destination, request.url);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  if (valid) {
    response.cookies.set(invitationCookieName(reference), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      maxAge: 7 * 24 * 60 * 60,
      path: invitationPath,
    });
  }

  return response;
}
