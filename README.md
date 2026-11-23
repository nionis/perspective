# Perspective

A free, no-signup page for the time still left: the year in days, weekends left, and estimates for visits and summers. Saved in your browser only.

The visual system, chart rules, and asset workflow live in [DESIGN.md](DESIGN.md).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Pages

- `/` shows the year as a grid of days, then weekends left, your summers left, and the visits left with grandparents. Ages, rates, and both horizons are saved in this browser's localStorage and restored on reload
- `/support` holds the yearly hosting goal and this year's supporters

Raised totals and supporter names are edited in `src/content/donations.ts`. The Support us action and the footer Support link open `https://introspect.school/#donate-heading`.
