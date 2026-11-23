import { NextResponse } from "next/server";
import { invitationAuthHref, invitationDestination } from "@/lib/invitations/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  const reference = requested?.match(/^\/invite\?ref=([a-f0-9]{24})$/)?.[1];
  const next = invitationDestination(reference) ?? (requested === "/profile" ? requested : "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const fallback = new URL(invitationAuthHref("/login", reference), origin);
  fallback.searchParams.set("error", "auth");
  return NextResponse.redirect(fallback);
}
