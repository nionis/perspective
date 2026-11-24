# Perspective

A free, no-signup page for the time still left: the year in days, weekends left, and estimates for visits and summers. Saved in your browser only.

The visual system, chart rules, and asset workflow live in [DESIGN.md](DESIGN.md). The working agreements live in [AGENTS.md](AGENTS.md).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/` shows the year as a grid of days, then weekends left, your summers left, and the visits left with grandparents. Ages, rates, and both horizons are saved in this browser's localStorage and restored on reload
- `/support` holds the yearly hosting goal and this year's supporters

Raised totals and supporter names are edited in `src/content/donations.ts`. The Support us action and the footer Support link open `https://introspect.school/#donate-heading`.

## Sharing a chart

Every plate has a share control with `Copy link` and `Copy image`. A link such as `/?chart=summers&age=6&horizon=85` opens that plate focused, dims the others, and never writes the shared values into the visitor's saved settings. Editing a field or clicking outside leaves the shared view. The same values drive the social card at `/api/og`, so a pasted link previews as that chart.

## Deploy

The site is a Next.js App Router app on Vercel.

```bash
npx vercel --prod
```

`NEXT_PUBLIC_SITE_URL` is optional; set it in the Vercel project when canonical and social URLs must name a specific origin, then redeploy. Without it the app uses `VERCEL_PROJECT_PRODUCTION_URL`, then `https://perspective-nioni.vercel.app`.

Changing the production origin also touches the static social card: edit the host label in `design/og.svg` and regenerate `public/og.png`. Share cards follow `SITE_URL`; the default card does not.
