# Deployment

## Vercel

1. Import Git repository
2. Framework preset: **Next.js** (not Other)
3. Root Directory: empty
4. Output Directory: **empty** (do not set `.next` or `out`)
5. Build Command: `npm run build`
6. Add environment variables from `.env.example`
7. Deploy

Build runs `prisma generate` via `postinstall` script.

`vercel.json` in the repo root forces Next.js detection when dashboard settings are wrong.

### Troubleshooting 404

If the build log shows `Build Completed in /vercel/output [90ms]` and no `npm run build` / `Compiled successfully`, Vercel is **not** building Next.js. Fix Framework Preset and Output Directory in **Settings → Build and Deployment**, then redeploy **without** build cache.

A healthy build takes 1–3 minutes and lists routes like `/login`, `/dashboard`.

## Database migrations (production)

```bash
DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
```

## Supabase

- Use **Transaction pooler** URL for `DATABASE_URL` (port 6543, `?pgbouncer=true`)
- Use **Direct** URL for `DIRECT_URL` (migrations)
- Run `supabase/rls.sql` in SQL Editor (optional)
- Configure Auth redirect URLs: `https://your-domain.vercel.app/auth/callback`

## PWA

`public/manifest.json` is linked in root layout metadata. Add `icon-192.png` and `icon-512.png` to `public/` for install prompts.

## Cost

Designed for Vercel Hobby + Supabase Free — no Redis, workers, or persistent servers required.
