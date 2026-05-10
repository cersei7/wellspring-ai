# WellSpring AI

Smart donation management for women's centers — powered by Claude.

Built for **HackDavis 2026**, targeting:
- Best Hack for Women's Center
- Best AI/ML Hack (sponsored by Anthropic)

## What it does

**Natural-language intake** — Volunteers type "got 3 boxes of canned food, 2 winter coats, 10 cans baby formula" and Claude parses it into structured inventory in under a second.

**Family-aware AI recommendations** — When supplies are scarce, the system automatically merges related beneficiaries into shared allocation units via Union-Find on the family relationship graph. Claude generates a one-sentence explanation for each ranking.

**Live inventory dashboard** — Real-time stock by category, computed from received donations minus distributions.

**AI-generated reports** — One click and Claude writes a stakeholder-ready report on the past 7 days.

## The priority engine

Score = 0.40 * NeedMatch + 0.25 * WaitTime + 0.20 * Urgency + 0.15 * Vulnerability

When stock falls below 1.5x total demand, scarcity mode activates and family members merge into shared allocation units. Otherwise each beneficiary is independent.

## Privacy by design

- Real names become anonymized IDs (BNF-A3F2) and never reach the AI
- Family relationships stored in a separate table
- Postgres Row-Level Security at the database layer
- All writes go through API routes with a service-role key; the browser never has direct write access

## Built with

Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres + RLS), Anthropic Claude API (claude-sonnet-4-6), Vercel.

## Run locally

git clone https://github.com/YOUR_USERNAME/wellspring-ai.git
cd wellspring-ai
npm install
cp .env.example .env.local
npm run dev

Required env vars:

ANTHROPIC_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Set up the database by running database/schema.sql in your Supabase SQL Editor.

## License

MIT
