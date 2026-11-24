# AGENTS.md

## Project

Perspective is a Next.js App Router site on Vercel. One dark page renders the time still left: a Sunday-first grid where every day is spent, today, or left, then the year in weekends, your summers left, and the visits left with grandparents. `/support` adds a static funding page.

Each plate carries a share control. A share link carries that chart's inputs, opens a focused view of the plate, and drives a per-share social image. The product name is Perspective.

There are no accounts, no database, no analytics, and no cookies. What a visitor types is saved in this browser's localStorage and never leaves it; the inputs and both horizons come back on reload. Share parameters are a read-only view override and are never written to storage. The only server code is the metadata renderer and the OG image route.

Read `DESIGN.md` before changing tokens, type, chart geometry, the share control, the Support page, or social assets. `README.md` is the human quick start.

## Stack

Next.js 16 App Router, React 19, TypeScript 6, CSS Modules, oxlint, Vitest 5, deployed on Vercel. `vite` stays in devDependencies only because Vitest 5 has it as a peer.

## Commands

```bash
npm install
npm run dev        # Next dev server on http://localhost:3000
npm test           # Vitest, node environment, src/**/*.test.ts
npm run lint       # oxlint
npm run build      # next build
npm start          # serve the production build
npx vercel --prod  # deploy
```

Run one test file or one case:

```bash
npx vitest run src/copy.test.ts
npx vitest run -t "weekends copy matches the fixed date"
```

## File map

```
next.config.ts                 font tracing for /api/og, /donate redirect
vitest.config.ts               node environment, src/**/*.test.ts
src/index.css                  design tokens, reset, global type, focus, .sr-only
src/app/layout.tsx             next/font, base metadata, viewport
src/app/page.tsx               home route, per-share generateMetadata
src/app/HomeClient.tsx         client-only Home loader (ssr: false)
src/app/support/page.tsx       Support route
src/app/[...slug]/page.tsx     redirect to /
src/app/api/og/route.tsx       GET /api/og, 1200x630 PNG
src/app/api/og/card.tsx        the share card renderer
src/app/api/og/IBMPlexMono-Regular.ttf, OFL.txt   card font and licence
src/site.ts                    SITE_URL from env
src/time.ts                    pure date math and year layout
src/time.test.ts               date and layout tests
src/life.ts                    pure visit-span and summer estimates, plate defaults
src/life.test.ts               estimate math tests
src/copy.ts                    every user-visible chart string
src/copy.test.ts               exact copy strings
src/unitGrid.ts                unit-grid columns, rects, geometry
src/unitGrid.test.ts           grid coverage tests
src/share/share.ts             the share URL contract: parse, serialize, image path
src/share/share.test.ts        URL contract tests
src/share/metadata.ts          per-share Metadata for the server page
src/share/metadata.test.ts     metadata assertions
src/share/clipboard.ts         copy text and copy-or-download image
src/storage.ts                 localStorage read and write behind a prefix
src/components/Layout.tsx      SiteHeader and SiteFooter
src/components/Plate.tsx       plate rule, head, share actions, focus dimming
src/components/ShareButton.tsx  share trigger, menu, status
src/components/ShareFocus.ts   focus-mode context and hook
src/components/YearGridChart.tsx  month row, weekday gutter, grid, legend, scroller
src/components/WeekendChart.tsx   Saturday+Sunday pairs, one block a weekend
src/components/VisitsChart.tsx    grandparents visits plate, fields, unit grid
src/components/SummersChart.tsx   one square a summer, horizon in the caption
src/components/UnitGrid.tsx       count to squares, spent and left, one svg pattern per color
src/components/NumberField.tsx    underlined numeric input with a mono label
src/components/InlineNumber.tsx   inline horizon input for a caption
src/components/Home.tsx        today tracking, share state, chart stack
src/components/Support.tsx     funding goal, progress, supporters
src/components/useStoredState.ts  state mirrored into localStorage, optional override
src/components/parseCount.ts   string to in-range whole number, or null
src/content/donations.ts       year, goal, raised total, supporters, support URL
design/og.svg                  source for the default social card
public/                        favicon.svg, apple-touch-icon.png, og.png
DESIGN.md                      visual system and chart rules
```

## Routes

|Path|Result|
|---|---|
|`/`|Home, year grid|
|`/support`|Support page|
|`/donate`|307 redirect to `/support` (next.config)|
|`GET /api/og`|per-share 1200×630 PNG, 400 on invalid parameters|
|anything else|307 redirect to `/`|

There is no nav. The header is the brand plus an optional mono date. Add routes only under `src/app`. A new page route shadows the catch-all automatically.

## Charts

Four plates stack on `/`, in this order. Every one is a `<Plate>`: mono title left, one mono statistic right, 1.5rem head gap, 1px `--line` top rule, mount animation. The plate head also carries the share control. None of them reads the clock except through data passed down from `Home`, and every string comes from `src/copy.ts`.

**The year, in days** — `src/components/YearGridChart.tsx`, data from `yearLayout(today)`.
- One cell per day of the year, Sunday-first, with leading and trailing blanks so months stay aligned.
- 53 columns in 2026, 54 in 2028. Fills its container; cells clamp 10–22px with 3px gaps, a 2rem weekday gutter, and a 2.5rem month offset.
- Spent is `--cell-spent`, left is `--ink`, today is an inset `--ink` ring. The text legend below the grid is the key for the whole page.
- On mount it scrolls today's cell into view only when that cell is outside the scroller; the whole year visible means no scroll.
- The grid owns a focusable horizontal scroller (`role="group"`, label "Year grid"); page-level horizontal scroll is a bug.
- Meta is `${days} days`. The `role="img"` label states spent, today, and left; cells and labels are `aria-hidden`.

**The year, in weekends** — `src/components/WeekendChart.tsx`, data from `weekendLayout(layout)`.
- One block per complete Saturday+Sunday pair; a leading lone Sunday or trailing lone Saturday is not a weekend. A pair is spent only when both days are spent, so a weekend in progress counts as left.
- 13 columns of pairs fill the plate width; 6px between pairs, 2px inside a pair, square cells from `aspect-ratio: 1`. 52 pairs take four rows; a 53rd wraps alone.
- Same fills as the year grid, plus the inset today ring. The next weekend — the first pair with a left day and no today — gets a 1px dotted `--ink` box at 2px offset. Never signal it with color.
- Meta is `${left} left`. Label: `52 weekends: 47 spent, 5 left.` plus `Next weekend is Nov 28.` when one exists.

**Your summers left** — `src/components/SummersChart.tsx`, `summersSpan(age, horizon)` in `src/life.ts`.
- `summersSpan(age, horizon)` returns `{ spent: min(age, horizon), left: max(0, horizon − age) }`, one square a summer from birth, spent first, so the block is `horizon` squares. The field is `Your age` (0–120) and opens on `DEFAULT_SUMMERS_AGE` (0).
- The horizon is the number printed in the caption, and it is the input: `One block a summer · until age [85]`. It defaults to `DEFAULT_HORIZON` (85), accepts 0–120, and is saved per plate. Never move it into its own field row.
- Blank is silent: head, field, meta `—`, no prose. A rejected age says `Enter a whole age from 0 to 120.` A zero left count says `No summers left by age ${horizon}.`
- Otherwise meta is `${left} summers` (or `1 summer`), label `${horizon} summers from age 0 to ${horizon}: ${spent} spent, ${left} left.`

**Grandparents visits left** — `src/components/VisitsChart.tsx`, `visitsSpan(age, perMonth, horizon)` in `src/life.ts`.
- `visitsSpan` runs from `max(0, age − 5)` to the horizon: `spent` is the lead years at that rate, `left` is what is ahead. One square a visit, spent squares first. Fields are `Their age` (0–120) and `Visits a month` (0–31); it opens on 75 and 2, so 120 spent and 240 left at the default horizon.
- The rate is monthly, never yearly, in the label, caption, and chart name.
- Past the five-year lead the chart makes no claim about real visits: it is the rate applied to a window, and the caption prints that window.
- Invalid input shows the prompt; a zero left count shows `No visits left by age ${horizon}.` Otherwise meta is `${left} visits`, caption `${rate} visits a month · age ${start} to [${horizon}]`, label `${total} visits from age ${start} to ${horizon}: ${spent} visits spent, ${left} visits left, at ${rate} visits a month.`
- The horizon is the same inline control as summers: the number in the caption, saved per plate as `visits.horizon`.

Shared: `UnitGrid` is the only place a count becomes squares; `src/unitGrid.ts` owns the columns, rects, and geometry. Both personal plates keep their values through `useStoredState`, which writes them to localStorage under the `perspective:` prefix.

## Share links

- Every plate head has a share trigger for `days`, `weekends`, `summers`, `visits`. There is no page-level share.
- URL contract, owned by `src/share/share.ts`: `/?chart=<days|weekends|summers|visits>`, plus for `summers` `age` and `horizon`; for `visits` `age`, `rate`, `horizon`. Integers only; age and horizon `0–120`, rate `0–31`. A missing personal field normalizes to the plate default (`summers`: 0/85, `visits`: 75/2/85). Any present field that is blank, non-integer, or out of range invalidates the whole share.
- A valid share opens a focused view: the plate is centered in the viewport when it fits and the document can scroll that far, otherwise it lands as close as the scroll range allows (the first plate stays near the top); focused plate at full opacity, every other plate at `opacity: 0.4`. `pointerdown` or `focusin` outside the focused plate, `Escape`, a field edit, or a deliberate scroll (more than 30% of the viewport height away from where the plate landed) dismisses it. No transition, no new motion.
- Dismissal clears the URL with `window.history.replaceState(window.history.state, "", "/")` and returns the viewport to where it was before the share scroll — the top of the page. A field edit or a scroll dismissal is the exception: both keep the viewport where it is, because the reader moved there on purpose. Scrolling enough unhides the rest of the page instead of leaving it dimmed.
- Share values are a view override, not storage. Arriving on a share link never writes localStorage. Editing one field in the focused chart exits share mode first, then saves only that edit; unedited shared values fall back to the visitor's stored values.
- A plate with a blank or invalid raw field shows no share trigger. A valid zero-left state is shareable and its image shows the empty sentence.
- `Copy link` writes `window.location.origin` plus the share path. `Copy image` fetches the same `/api/og` PNG social crawlers use and writes it to the clipboard; when the image clipboard is unavailable or refused it downloads `perspective-<chart>.png`.
- The menu is the only popup: `role="menu"` with `Copy link` and `Copy image`, arrows and Home/End move, Escape closes it first and returns focus to the trigger, and an outside pointerdown closes it.

## Architecture rules

- All date logic lives in `src/time.ts`. Keep it pure, local-calendar based, and free of timezone libraries.
- `yearLayout` marks days before today `"spent"`, today `"today"`, and the rest `"left"`.
- Add tests for both ends of a year, leap years, and a year that needs 54 columns.
- Personal estimates live in `src/life.ts`: visits from five years back to the horizon, and the summers from birth to the horizon. Keep it pure. `AGE_MAX`, `VISITS_PER_MONTH_MAX`, `DEFAULT_HORIZON`, and the plate defaults live there.
- Summers run from birth to the horizon; visits start five years back, clamped at 0. Both draw the years behind them spent. There is no second horizon.
- `DEFAULT_HORIZON` (85) is where both plates start. Each plate edits its own horizon in its caption and saves it; there is still only one horizon per plate, never a second one.
- `src/copy.ts` owns every user-visible chart string: titles, meta, labels, captions, share lines, image captions, and the empty sentences. Components and the card format nothing themselves.
- Estimate inputs and both horizons persist through `useStoredState` into localStorage, keys prefixed `perspective:`. That is the only storage: no cookies, no sessionStorage, no network writes, no analytics. Never persist a share parameter.
- `useStoredState(key, fallback, override?)` reads once, keeps an `edited` value, and returns `edited ?? override ?? stored`. It has no mount effect: nothing is written until the reader changes a field.
- Components do not read the clock. `Home` owns today through `useToday()` and refreshes only when the date string changes. The estimate charts never read the clock.
- `Home` is loaded through `next/dynamic` with `ssr: false` in `src/app/HomeClient.tsx`, so `new Date()` and `window` never run during prerender. Read the share URL in a lazy `useState` initializer there.
- Charts receive data. They do not compute month or weekday values from a fresh `Date` except when turning the layout back into a label.
- Relative imports keep their `.ts` and `.tsx` extensions; `allowImportingTsExtensions` plus `noEmit` permits them. `verbatimModuleSyntax` is on, so type-only imports use `import type`.
- Use named exports for components and pages; only route files and the Next config use a default export.

## Styling rules

- One CSS Module per component. Global tokens, reset, and shared utilities live in `src/index.css`. Raw hex is allowed only in `src/app/api/og/card.tsx`, which renders outside CSS.
- Match `DESIGN.md`. No second hue, no rounded corners, no gradients, no drop shadows, no grain, no background images. The inset today ring is the only `box-shadow` in the app.
- Bone means days left, gray means spent, an outline means today. Keep the grid and legend in agreement.
- Every chart fills the plate width: the year grid, the weekend grid, and both unit grids. A chart capped at a pixel width, or left at its natural size inside a wide plate, reads as zoomed out; that is a bug, not a thumbnail.
- Unit grids borrow the weekend scale: columns are `max(26, ceil(sqrt(count * 4)))`, so no cell is larger than a weekend cell and the block stays roughly four times as wide as tall. Do not reintroduce a `max-width` cap or a fixed cell size.
- Unit grids draw bone for what is left and `--cell-spent` for what is behind: the summers lived, and the five lead years of visits. No legend of their own — the year grid's legend above is the key for the page.
- The inset today ring appears on the year grid and on the weekend chart. No other `box-shadow`.
- The share trigger is a 1.75rem square with a 16px currentColor icon; the menu is `--bg` with a 1px `--line-strong` border, no radius and no shadow; the status line is 10px mono `--ink-muted` under the trigger and must not move layout. On coarse pointers the trigger is 44px pulled back by a negative margin, and menu items are 44px tall.
- Focus mode dims the other plates with `opacity: 0.4 !important`; the `!important` is what beats the held mount animation without changing `animation-name`, so dismissing a share never restarts the plates.
- The grid keeps its focusable horizontal scroller. Page-level horizontal scrolling is a bug. The weekend grid and the unit grids must fit the content width instead.
- The only motion is the `.plate` mount animation, guarded by `prefers-reduced-motion: no-preference`. Input changes, share menu opening, focus mode, and dismissal do not animate.
- Touch pointers: the inline horizon is 16px with a 44px hit box; header, footer, Support, and share links are 44px targets without growing the layout (a 44px box pulled back by a negative margin).

## Content and support

- Edit `src/content/donations.ts` for the year, goal, raised total, and supporters. Do not hard-code those values in components.
- The Support us action and the footer Support link both point at `SUPPORT_URL` in `src/content/donations.ts`, currently `https://introspect.school/#donate-heading`. Change it there, not in the components.
- An empty supporter list renders one message. A card links to X only when that supporter has `x`.
- `/support` is the only dim surface. Body, headings, track fill, and supporter meta use `--ink-dim`; only the action uses `--ink`.

## Metadata and assets

- `src/app/layout.tsx` owns the base metadata: title, description, canonical, Open Graph, Twitter, icons, theme color, fonts. Use the Next Metadata API, not a hand-written head.
- The base social image is `public/og.png` (1200×630) from `design/og.svg`. A valid share URL replaces it with `/api/og?…`.
- Two places name the production host, not one. `SITE_URL` in `src/site.ts` feeds canonical, `og:url`, the image URLs, and the `/api/og` host label. The bottom-right label in `design/og.svg` is the uppercase host with no scheme (`PERSPECTIVE-NIONI.VERCEL.APP`) baked into `public/og.png`. A domain change updates both and re-rasterizes `public/og.png`; the static card cannot follow an env var.
- `src/app/page.tsx` exports `generateMetadata` and `dynamic = "force-dynamic"`. It parses the query string, and `src/share/metadata.ts` renders title, description, canonical, `og:url`, `og:image`, and `twitter:image` from the same copy and the same image URL the share control uses. Social previews depend on this server response; client JavaScript is never involved.
- Days and weekends image URLs carry `d=YYYY-MM-DD` so the card is deterministic for that day. The visible share URL never carries `d`.
- `SITE_URL` in `src/site.ts` resolves `NEXT_PUBLIC_SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, then `https://perspective-nioni.vercel.app`. `metadataBase` comes from it, so canonical and social URLs are absolute.
- The card renders with `ImageResponse` (Satori) in `src/app/api/og/card.tsx`. It uses IBM Plex Mono from `src/app/api/og/IBMPlexMono-Regular.ttf` (SHA-256 `7c6fbddca4b700be918f5f6183d9bd4464fa427fe435f0b480d77fe2bb8c5a43`) and that directory's `OFL.txt`. `next.config.ts` traces the font into the function; do not move it without updating `outputFileTracingIncludes`.
- After changing `design/og.svg` or `public/favicon.svg`, regenerate the PNGs and verify sizes:

```bash
sips -g pixelWidth -g pixelHeight public/og.png public/apple-touch-icon.png
```

Expected `1200×630` and `180×180`. Render at an exact viewport; `qlmanage` pads the card to a square. Details are in `DESIGN.md`.

## Deployment

- `vercel` builds `npm run build` and serves the App Router: the home page, `/support`, the `/donate` redirect, the catch-all redirect, and `/api/og`.
- Deploy with `npx vercel --prod`. Unknown paths are handled by `src/app/[...slug]/page.tsx`, so no rewrite config is needed.
- The card font is traced into the `/api/og` function; `next.config.ts` is the only place that list lives.
- `NEXT_PUBLIC_SITE_URL` is optional. Set it in the Vercel project when the absolute metadata must name a specific origin, and redeploy.
- A production-origin change is not env-only: it also edits the host label in `design/og.svg` and regenerates `public/og.png`. See Metadata and assets.
- The repo has no CI configuration. Run the three checks locally before shipping.

## Verification

Run `npm test`, `npm run lint`, and `npm run build` before calling work done.

For a visual change, start `npm run dev` and check:

- `/` at 1440×900 and 375×812.
- At 375, `document.documentElement.scrollWidth <= window.innerWidth`; the grid scroller still overflows.
- Tab reaches the grid scroller, the estimate fields, the share triggers, and the footer links, with visible focus rings. Arrow keys scroll the grid. The chart grids are not tab stops.
- The grid label and legend report the same spent and left values.
- The weekend chart on 23 Nov 2026 reads 52 weekends, 47 spent, 5 left, and its cells fill the plate width. The next weekend (28–29 Nov) carries a dotted box and the chart label ends `Next weekend is Nov 28.`
- Every chart measures the same width as the plate at 1440 and at 375: the year grid, the weekend grid, and both unit grids. No grid is narrower than the column, and none is capped at a fixed cell size.
- The grandparents visits plate has two fields and opens on 75, 2 a month, horizon 85: title `Grandparents visits left`, meta `240 visits`, caption `2 visits a month · age 70 to 85` with the 85 editable in place, 360 squares with the first 120 spent. Age 85 reads `0 visits` with the empty state; age 3 starts at 0 with 72 spent. The label reads `360 visits from age 70 to 85: 120 visits spent, 240 visits left, at 2 visits a month.` Emptying a field or typing a decimal returns the prompt, and the label says `month`, never `year`.
- The horizon number in each caption is the input: setting 90 on visits at 75 / 2 reads `540 visits` with 180 spent, and setting 100 on summers at 40 reads `60 summers` in a 100-square block. Both survive a reload.
- The `Your summers left` plate sits directly under weekends, opens on age `0` with meta `85 summers` and 85 bone squares, and counts the reader's summers to age 85 from the `Your age` field: `6` shows 6 spent and 79 bone with meta `79 summers`, `84` shows 84 spent and 1 bone, `85` shows `0 summers` and the empty state, and a rejected entry explains the accepted range. Clearing the field is silent: head, field, meta `—`, and no share trigger.
- Reload restores every saved value — visits age and rate, both horizons — from localStorage keys prefixed `perspective:`. Clearing site data restores the defaults: visits 75 and 2, both horizons 85, summers age 0. No cookies, sessionStorage, or network writes, and a first visit writes nothing.
- `/support` is dim, the progressbar has its aria values, and the action points at `https://introspect.school/#donate-heading`. The footer Support link uses the same URL.
- `/donate` lands on `/support`; `/reminders` and `/about` land on `/`.
- Share checks:
  - `/?chart=summers&age=6&horizon=85` shows 6 and 85 in the fields, dims the other three plates to `0.4`, centers the summers plate in the viewport, and leaves localStorage untouched.
  - Clicking outside the focused plate, or pressing Escape, clears the URL, restores the saved values, and returns the page to the top at full opacity. Editing one field clears the URL and saves only that field without moving the viewport.
  - Scrolling more than 30% of the viewport height away from the focused plate clears the URL, restores the saved values, and unhides every plate where it stands. A short scroll or scrolling the year grid sideways does not dismiss.
  - Each plate head has one share trigger; a blank or invalid field removes that plate's trigger; a zero-left state keeps it.
  - `Copy link` writes the current origin with the current values; `Copy image` reports `Image copied` or downloads `perspective-<chart>.png` and reports `Image downloaded`; the status clears after ~2.5s.
  - With a share focused, Escape clears it. With the menu open, Escape closes the menu and keeps the focus mode.
- `curl -s 'http://localhost:3000/?chart=summers&age=6&horizon=85'` contains the share `<title>`, `og:title`, `og:description`, absolute `og:image`, `twitter:image`, and canonical. `/?chart=days` puts `d=YYYY-MM-DD` in the image URL only.
- `curl -s -o /tmp/card.png 'http://localhost:3000/api/og?chart=summers&age=6&horizon=85'` returns a 1200×630 PNG that matches the plate; `chart=summers&age=999` returns 400.
- After a production-origin change, the canonical host, `/`'s `og:image` URL, the `/api/og` card, and the bottom-right label of `public/og.png` all name the new origin. Open the PNG, then run `grep -rn '<old host>' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next` and expect no output. The static PNG is the surface that gets skipped.

Assert against the formulas in `src/time.ts`, `src/life.ts`, and the strings in `src/copy.ts`, not against a sample date.

## Gotchas

- The grid is Sunday-first. Mon, Wed, and Fri labels belong on rows 2, 4, and 6, not rows 1, 3, and 5.
- The weekend chart counts only complete Saturday+Sunday pairs. A leading Sunday with no Saturday before it, or a trailing Saturday with no Sunday after it, is not a weekend.
- `weekendLayout.next` is the first pair with a `left` day and no `today` day, so a weekend in progress never reads as the next one.
- Home plate order is fixed: year in days, year in weekends, your summers left, grandparents visits left. The two personal plates stay at the bottom, summers first.
- Horizons are per plate and editable in the caption (`summers.horizon`, `visits.horizon`). Summers count from birth and visits from `LEAD_YEARS` before today's age, clamped at 0; both draw those years spent. Never hard-code 85 outside `DEFAULT_HORIZON`.
- 2026 lays out in 53 columns; 2028 needs 54.
- `yearLayout` must keep leading and trailing blanks so months stay aligned.
- Share parameters are a view override: never write them to storage, never put a stored value in the URL after dismissal, and never persist `d`.
- `useStoredState` must stay free of a mount effect; writing defaults on mount is the bug it replaced.
- Focus-mode dimming uses `opacity: 0.4 !important` so it wins over the mount animation's held `opacity: 1`. Setting `animation: none` instead restarts every plate on dismissal.
- The page-level Escape listener must ignore events whose target is inside `[role="menu"]`; React's root listener on `document` runs before ours, so `stopPropagation` in the menu cannot prevent a same-node later listener.
- The scroll dismissal listens on `window` only, so the year-grid scroller never dismisses share mode. The threshold is measured from the position the plate actually landed at, not the requested center, because the document end clamps it.
- Share centering is best-effort: the first plate cannot be centered because the page cannot scroll above it, and the last plate is capped by the document end. Do not add filler space to force it.
- `--ink-dim` is not a general-purpose muted color. It is for `/support` only.
- localStorage is the only persistence. A dependency that adds cookies, analytics, or app-data requests is out of scope. The footer must keep saying it saves in this browser.
- Do not edit `/Users/nioni/Documents/work/introspect`.

## Before committing

- `npm test`, `npm run lint`, and `npm run build` pass.
- Update `DESIGN.md` when the visual system, chart rules, share control, or asset workflow changes.
- Do not commit `.next/`, `.vercel/`, or `dist/`; they are ignored.
