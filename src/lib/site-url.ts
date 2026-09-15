import { headers } from "next/headers";

/** Origin for auth redirect emails (password reset, etc.). */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const protocol = headersList.get("x-forwarded-proto") ?? "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}
