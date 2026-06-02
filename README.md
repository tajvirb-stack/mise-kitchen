# Mise — Your Kitchen

A real-time, multi-device, household-shared meal planning app. Built with React, Vite, and Supabase.

## Features
- 20 HelloFresh recipes pre-loaded (with from-scratch substitutions for HelloFresh-only ingredients)
- Weekly meal planning across the days of the week
- Pantry-aware grocery list (auto-subtracts what you already have)
- Prep day consolidation (knock out chopping/mincing for the whole week at once)
- Cooking mode with tap-to-start timers and auto-screen-wake
- Servings scaler (everyone needs to eat? 2x button)
- Protein swap intelligence (change "chicken" to "tofu", and the steps update)
- Real-time sync between you and household members across all devices
- Installable on phones (PWA — Add to Home Screen)

## Stack
- **Frontend:** Vite + React + Lucide icons
- **Backend / DB / Auth:** Supabase (free tier)
- **Hosting:** Vercel (free tier)

## Local development

```bash
npm install
cp .env.example .env
# Edit .env and paste in your Supabase URL and anon key
npm run dev
```

Then open http://localhost:5173

## Deployment

Push this repo to GitHub, then in Vercel:
1. "Import Project" → pick your GitHub repo
2. Add the two environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy.

## License
MIT — built for personal use.
