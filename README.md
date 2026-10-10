# Skill2Project AI

Explainable project recommendations for college students based on skills, target role, budget and weekly time.

## Run
```
bun install
bun run dev
```
Open the app and click **Try Demo** — no account or API keys required. All data is stored in the browser.

## Recommendation engine (`src/lib/recommend.ts`)
Deterministic score (0–100): role relevance 35%, skill compatibility 30%, learning value / skill gaps 15%, difficulty fit 10%, budget & time 10%. Budget and time mismatches are reported separately. Verified assessment levels override self-reported levels.

## Backend (optional)
`supabase/schema.sql` contains tables, indexes, RLS policies and seed data. See `.env.example`. Never put service-role keys in frontend code.

## Deploy
Publish from Lovable, or build with `bun run build` and deploy to any edge/Workers host.
