import { execFileSync } from "node:child_process";

const ref = "zzeyijpqfpvomdujhxrl";
if (process.env.VERCEL_ENV !== "preview" ||
    process.env.VERCEL_GIT_COMMIT_REF !== "ops/cg-04-preview-migration") {
  throw new Error("This migration requires the temporary Vercel Preview branch.");
}
for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
  let url;
  try { url = new URL(process.env[name]); } catch {}
  const direct = url?.hostname === `db.${ref}.supabase.co`;
  const pooler = url?.hostname.endsWith(".pooler.supabase.com") &&
    decodeURIComponent(url.username) === `postgres.${ref}`;
  if (!(direct || pooler) || !["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error(`${name} is unavailable or does not identify control-gym-preview.`);
  }
}
console.log("Verified Supabase Preview target.");
for (const command of ["deploy", "status"]) {
  execFileSync("./node_modules/.bin/prisma", ["migrate", command], { stdio: "inherit" });
}
