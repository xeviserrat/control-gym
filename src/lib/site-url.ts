import { headers } from "next/headers";

/**
 * Origin for auth redirect emails (password reset, etc.).
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL — set per environment (.env.local dev, Vercel Production)
 * 2. Request host — production/preview when env is missing
 * 3. http://localhost:3000 — local development fallback
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const protocol = headersList.get("x-forwarded-proto") ?? "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}
