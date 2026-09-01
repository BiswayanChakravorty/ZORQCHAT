# ZORD MVP 1

ZORD is a deliberately simple AI creative discovery product: browse a curated image/prompt catalog, open a structured prompt, add a reference image, generate a personalized result, and publish it through a ZORD profile/community layer.

## Implemented

- ZORD landing page
- Explore/search/category gallery
- ZORD Founding 100 catalog seed
- Prompt detail pages with copy action
- `Use This Prompt` → creator flow
- Reference-image upload
- GPT Image 1.5 generation route
- Demo generation fallback when `OPENAI_API_KEY` is absent
- Supabase email/password auth UI
- Official ZORD profile
- Lightweight trending feed
- Supabase schema with profiles, prompts, generations, posts and RLS

The current gallery uses deterministic placeholder image URLs. These are scaffolding assets. Before launch, replace them with original/licensed ZORD-owned AI artwork and seed the real prompt records.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `OPENAI_API_KEY` in `.env.local`. Run `supabase/schema.sql` in the Supabase SQL editor before enabling real profiles/generations.

## Image generation

The API uses OpenAI GPT Image 1.5 when `OPENAI_API_KEY` is configured. Without a key, the route returns a deterministic ZORD demo image so the frontend can be tested without paid API usage.

## MVP boundary

Do not add Story Lab, messaging, B2B marketplace, creator payouts, video generation, BYOK, or a proprietary image model to MVP 1. The first launch should prove:

**Explore → Prompt → Reference → Generate → Profile → Share/Remix**
