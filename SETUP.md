# Maskulino — Backend setup (one-time, ~30 min, $0)

## 1. Supabase projects (2, Free)
1. Create org + project `maskulino-dev`, then `maskulino-prod`.
2. In **each**: SQL Editor → run in order
   `supabase/migrations/0001_schema.sql` → `0002_seed_base.sql` →
   `0003_seed_catalog.sql` → `0006_category_slug.sql` → `0007_public_tracking.sql` → `0005_storage.sql`.
3. On **dev only**: run `0004_seed_demo.sql` (fake orders for training/QA).
4. Keys needed (Project Settings → API + Database):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never in client code)
   - DB password + host (only for the backup workflow secrets)

## 2. VAPID (Web Push, free forever)
`npx web-push generate-vapid-keys` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT=mailto:contact@maskulino.dz`.

## 3. Telegram bot (free)
1. BotFather → `/newbot` → name it (e.g. `MaskulinoOrdersBot`) → copy token → `TELEGRAM_BOT_TOKEN`.
2. `NEXT_PUBLIC_TELEGRAM_BOT=<BotUsernameWithoutAt>`.
3. After deploy, register the webhook **once**:
   `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://maskulino.dz/api/telegram/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>"`
4. Imad: Paramètres → Telegram → `@username` → Connecter → Start in Telegram → gets ✅ confirmation.

## 4. Order push webhook (Supabase → Vercel)
Database → Webhooks → Create: table `orders`, events INSERT, method POST,
URL `https://maskulino.dz/api/push/new-order`, header `x-webhook-secret: <PUSH_WEBHOOK_SECRET>`.

## 5. Vercel env (Production + Preview)
All of: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT`, `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT`,
`TELEGRAM_WEBHOOK_SECRET`, `PUSH_WEBHOOK_SECRET`, `KEEPALIVE_SECRET`
(random 32+ chars for the three `*_SECRET`). Local dev: copy `.env.example` → `.env.local`.

## 6. GitHub secrets (repo Settings → Secrets → Actions)
`SUPABASE_URL` + `SUPABASE_ANON_KEY` (prod, for keepalive),
`SUPABASE_DB_HOST` + `SUPABASE_DB_PASSWORD` (prod, for weekly dumps).

## 7. Go-live checklist
- [ ] Migrations applied on prod (NOT 0004 demo)
- [ ] Imad re-uploads the 5 product photo sets via Catalogue (blob URLs can't migrate)
- [ ] Test order end-to-end → admin sees it → confirm → stock decremented
- [ ] Push test + Telegram test green from Paramètres
- [ ] Track-order lookup with real number
- [ ] Keepalive + backup workflows ran once manually (Actions tab)
- [ ] Old localStorage data ignored (cart keeps working per-device)

## 8. If the Supabase project ever pauses (Free tier)
Dashboard → project → Restore (1 click). Prevention is automated (daily Vercel cron + 3-day GitHub ping).
If disaster strikes: newest `weekly-db-backup` artifact → `pg_restore` to a fresh project → swap env URL → redeploy.
