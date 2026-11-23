# AGENTS.md

## Project

Perspective is a client-only single-page app. One dark page renders the time still left: a Sunday-first grid where every day is spent, today, or left, then the year in weekends, your summers left, and the visits left with grandparents. `/support` adds a static funding page.

There are no accounts, no backend, no analytics, and no cookies. What a visitor types is saved in this browser's localStorage and never leaves it; the inputs and both horizons come back on reload. The product name is Perspective.

Read `DESIGN.md` before changing tokens, type, chart geometry, the Support page, or social assets. `README.md` is the human quick start.

## Stack

Vite 8, React 19, TypeScript 6, React Router 7, CSS Modules, oxlint, Vitest 5.

## Commands

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm test           # Vitest, node environment, src/**/*.test.ts
npm run lint       # oxlint
npm run build      # tsc -b && vite build, output in dist/
npm run preview    # serve dist/
```

Run one test file or one case:

```bash
npx vitest run src/time.test.ts
npx vitest run -t "year layout"
```

## File map

```
index.html                     shell, fonts, metadata, icon links
src/main.tsx                   React root
src/App.tsx                    routes
src/index.css                  design tokens, reset, global type, focus, .sr-only
src/time.ts                    pure date math and year layout
src/time.test.ts               date and layout tests
src/life.ts                    pure visit-span and summer estimates
src/life.test.ts               estimate math tests
src/storage.ts                 localStorage read and write behind a prefix
src/components/Layout.tsx      SiteHeader and SiteFooter
src/components/Plate.tsx       plate rule, head, and mount animation
src/components/YearGridChart.tsx  month row, weekday gutter, grid, legend, scroller
src/components/WeekendChart.tsx   Saturday+Sunday pairs, one block a weekend
src/components/VisitsChart.tsx    grandparents visits plate, two fields, unit grid
src/components/SummersChart.tsx   one square a summer, to the horizon set in the caption
src/components/UnitGrid.tsx       count to squares, spent and left, one svg pattern per color
src/components/NumberField.tsx    underlined numeric input with a mono label
src/components/InlineNumber.tsx   inline horizon input for a caption
src/components/useStoredState.ts  state mirrored into localStorage
src/components/parseCount.ts      string to in-range whole number, or null
src/pages/Home.tsx             today tracking, chart stack
src/pages/Support.tsx          funding goal, progress, supporters
src/content/donations.ts       year, goal, raised total, supporters, support URL
design/og.svg                  source for the social card
public/                        favicon.svg, apple-touch-icon.png, og.png
DESIGN.md                      visual system and chart rules
```

## Routes

| Path | Result |
| --- | --- |
| `/` | Home, year grid |
| `/support` | Support page |
| `/donate` | redirect to `/support` |
| anything else | redirect to `/` |

There is no nav. The header is the brand plus an optional mono date. Add or change routes only in `src/App.tsx`. The host must serve `index.html` for unknown paths because routing is client-side.

## Charts

Four plates stack on `/`, in this order. Every one is a `<Plate>`: mono title left, one mono statistic right, 1.5rem head gap, 1px `--line` top rule, mount animation. None of them reads the clock except through data passed down from `Home`.

**The year, in days** — `src/components/YearGridChart.tsx`, data from `yearLayout(today)`.
- One cell per day of the year, Sunday-first, with leading and trailing blanks so months stay aligned.
- 53 columns in 2026, 54 in 2028. Fills its container; cells clamp 10–22px with 3px gaps, a 2rem weekday gutter, and a 2.5rem month offset.
- Spent is `--cell-spent`, left is `--ink`, today is an inset `--ink` ring. The text legend below the grid is the key for the whole page.
- The grid owns a focusable horizontal scroller (`role="group"`, label "Year grid"); page-level horizontal scroll is a bug.
- Meta is `${days} days`. The `role="img"` label states spent, today, and left; cells and labels are `aria-hidden`.

**The year, in weekends** — `src/components/WeekendChart.tsx`, data from `weekendLayout(layout)`.
- One block per complete Saturday+Sunday pair; a leading lone Sunday or trailing lone Saturday is not a weekend. A pair is spent only when both days are spent, so a weekend in progress counts as left.
- 13 columns of pairs fill the plate width; 6px between pairs, 2px inside a pair, square cells from `aspect-ratio: 1`. 52 pairs take four rows; a 53rd wraps alone.
- Same fills as the year grid, plus the inset today ring. The next weekend — the first pair with a left day and no today — gets a 1px dotted `--ink` box at 2px offset. Never signal it with color.
- Meta is `${left} left`. Label: `52 weekends: 47 spent, 5 left.` plus `Next weekend is Nov 28.` when one exists.

**Your summers left** — `src/components/SummersChart.tsx`, `summersSpan(age, horizon)` in `src/life.ts`.
- `summersSpan(age, horizon)` returns `{ spent: min(age, horizon), left: max(0, horizon − age) }`, one square a summer from birth, spent first, so the block is `horizon` squares. The field is `Your age` (0–120) and opens on 0.
- The horizon is the number printed in the caption, and it is the input: `One block a summer · until age [85]`. It defaults to 85, accepts 0–120, and is saved per plate. Never move it into its own field row.
- Blank is silent: head, field, meta `—`, no prose. A rejected age says `Enter a whole age from 0 to 120.` A zero left count says `No summers left by age ${horizon}.`
- Otherwise meta is `${left} summers` (or `1 summer`), label `${horizon} summers from age 0 to ${horizon}: ${spent} spent, ${left} left.`

**Grandparents visits left** — `src/components/VisitsChart.tsx`, `visitsSpan(age, perMonth, horizon)` in `src/life.ts`.
- `visitsSpan` runs from `max(0, age − 5)` to the horizon: `spent` is the lead years at that rate, `left` is what is ahead. One square a visit, spent squares first. Fields are `Their age` (0–120) and `Visits a month` (0–31); it opens on 75 and 2, so 120 spent and 240 left at the default horizon.
- The rate is monthly, never yearly, in the label, caption, and chart name.
- Past the five-year lead the chart makes no claim about real visits: it is the rate applied to a window, and the caption prints that window.
- Invalid input shows the prompt; a zero left count shows `No visits left by age ${horizon}.` Otherwise meta is `${left} visits`, caption `${rate} visits a month · age ${start} to [${horizon}]`, label `${total} visits from age ${start} to ${horizon}: ${spent} visits spent, ${left} visits left, at ${rate} visits a month.`
- The horizon is the same inline control as summers: the number in the caption, saved per plate as `visits.horizon`.

Shared: `UnitGrid` is the only place a count becomes squares; both personal plates keep their values through `useStoredState`, which writes them to localStorage under the `perspective:` prefix.

## Architecture rules

- All date logic lives in `src/time.ts`. Keep it pure, local-calendar based, and free of timezone libraries.
- `yearLayout` marks days before today `"spent"`, today `"today"`, and the rest `"left"`.
- Add tests for both ends of a year, leap years, and a year that needs 54 columns.
- Personal estimates live in `src/life.ts`: visits from five years back to the horizon, and the summers from birth to the horizon. Keep it pure.
- Summers run from birth to the horizon; visits start five years back, clamped at 0. Both draw the years behind them spent. There is no second horizon.
- `DEFAULT_HORIZON` (85) is where both plates start. Each plate edits its own horizon in its caption and saves it; there is still only one horizon per plate, never a second one.
- Estimate inputs and both horizons persist through `useStoredState` into localStorage, keys prefixed `perspective:`. That is the only storage: no cookies, no sessionStorage, no network, no analytics. Never put a value in the URL.
- Components do not read the clock. `Home` owns today through `useToday()` and refreshes only when the date string changes. The estimate charts never read the clock.
- Charts receive data. They do not compute month or weekday values from a fresh `Date` except when turning the layout back into a label.
- Keep relative imports with their `.ts` and `.tsx` extensions. `verbatimModuleSyntax` is on, so type-only imports use `import type`.
- Use named exports for components and pages. `App` is the only default export.

## Styling rules

- One CSS Module per component. Global tokens, reset, and shared utilities live in `src/index.css`.
- Never put raw hex or `rgb()` values in a module. Use the tokens.
- Match `DESIGN.md`. No second hue, no rounded corners, no gradients, no drop shadows, no grain, no background images. The inset today ring is the only `box-shadow`.
- Bone means days left, gray means spent, an outline means today. Keep the grid and legend in agreement.
- Every chart fills the plate width: the year grid, the weekend grid, and both unit grids. A chart capped at a pixel width, or left at its natural size inside a wide plate, reads as zoomed out; that is a bug, not a thumbnail.
- Unit grids borrow the weekend scale: columns are `max(26, ceil(sqrt(count * 4)))`, so no cell is larger than a weekend cell and the block stays roughly four times as wide as tall. Do not reintroduce a `max-width` cap or a fixed cell size.
- Unit grids draw bone for what is left and `--cell-spent` for what is behind: the summers lived, and the five lead years of visits. No legend of their own — the year grid's legend above is the key for the page.
- The inset today ring appears on the year grid and on the weekend chart. No other `box-shadow`.
- The grid keeps its focusable horizontal scroller. Page-level horizontal scrolling is a bug. The weekend grid and the unit grids must fit the content width instead.
- The only motion is the `.plate` mount animation, guarded by `prefers-reduced-motion: no-preference`. Input changes do not animate.
- Do not add navigation, a marketing hero, or a hero number.

## Content and support

- Edit `src/content/donations.ts` for the year, goal, raised total, and supporters. Do not hard-code those values in components.
- The Support us action and the footer Support link both point at `SUPPORT_URL` in `src/content/donations.ts`, currently `https://introspect.school/#donate-heading`. Change it there, not in the components.
- An empty supporter list renders one message. A card links to X only when that supporter has `x`.
- `/support` is the only dim surface. Body, headings, track fill, and supporter meta use `--ink-dim`; only the action uses `--ink`.

## Metadata and assets

- `index.html` is the single source for title, description, canonical, Open Graph, Twitter, theme color, and fonts.
- Use the production origin `https://perspective.nonicorp.com/` in canonical and social URLs. `og:url` matches canonical and `og:image` is absolute.
- After changing `design/og.svg` or `public/favicon.svg`, regenerate the PNGs and verify sizes:

```bash
sips -g pixelWidth -g pixelHeight public/og.png public/apple-touch-icon.png
```

Expected `1200×630` and `180×180`. Render at an exact viewport; `qlmanage` pads the card to a square. Details are in `DESIGN.md`.

## Deployment

- `npm run build` writes a static site to `dist/`. There is no server runtime, database, or secret.
- Deploy `dist/` to `https://perspective.nonicorp.com/`.
- Rewrite unknown paths to `/index.html` so direct visits to `/support` and `/donate` reach the router.
- The support destination is compiled from `src/content/donations.ts`, so changing it requires a rebuild.
- The repo has no CI configuration. Run the three checks locally before shipping.

## Verification

Run `npm test`, `npm run lint`, and `npm run build` before calling work done.

For a visual change, start `npm run dev` and check:

- `/` at 1440×900 and 375×812.
- At 375, `document.documentElement.scrollWidth <= window.innerWidth`; the grid scroller still overflows.
- Tab reaches the grid scroller, the estimate fields, and the footer links, with visible focus rings. Arrow keys scroll the grid. The chart grids are not tab stops.
- The grid label and legend report the same spent and left values.
- The weekend chart on 23 Nov 2026 reads 52 weekends, 47 spent, 5 left, and its cells fill the plate width. The next weekend (28–29 Nov) carries a dotted box and the chart label ends `Next weekend is Nov 28.`
- Every chart measures the same width as the plate at 1440 and at 375: the year grid, the weekend grid, and both unit grids. No grid is narrower than the column, and none is capped at a fixed cell size.
- The grandparents visits plate has two fields and opens on 75, 2 a month, horizon 85: title `Grandparents visits left`, meta `240 visits`, caption `2 visits a month · age 70 to 85` with the 85 editable in place, 360 squares with the first 120 spent. Age 85 reads `0 visits` with the empty state; age 3 starts at 0 with 72 spent. The label reads `360 visits from age 70 to 85: 120 visits spent, 240 visits left, at 2 visits a month.` Emptying a field or typing a decimal returns the prompt, and the label says `month`, never `year`.
- The horizon number in each caption is the input: setting 90 on visits at 75 / 2 reads `540 visits` with 180 spent, and setting 100 on summers at 40 reads `60 summers` in a 100-square block. Both survive a reload.
- The `Your summers left` plate sits directly under weekends, opens on age `0` with meta `85 summers` and 85 bone squares, and counts the reader's summers to age 85 from the `Your age` field: `6` shows 6 spent and 79 bone with meta `79 summers`, `84` shows 84 spent and 1 bone, `85` shows `0 summers` and the empty state, and a rejected entry explains the accepted range. Clearing the field is silent: head, field, meta `—`, no prose.
- Reload restores every saved value — visits age and rate, both horizons — from localStorage keys prefixed `perspective:`. Clearing site data restores the defaults: visits 75 and 2, both horizons 85, summers age 0. No cookies, sessionStorage, or network writes.
- `/support` is dim, the progressbar has its aria values, and the action points at `https://introspect.school/#donate-heading`. The footer Support link uses the same URL.
- `/donate` lands on `/support`; `/reminders` and `/about` land on `/`.
- `dist/index.html` contains absolute production URLs after a build.

Assert against the formulas in `src/time.ts`, not against a sample date.

## Gotchas

- The grid is Sunday-first. Mon, Wed, and Fri labels belong on rows 2, 4, and 6, not rows 1, 3, and 5.
- The weekend chart counts only complete Saturday+Sunday pairs. A leading Sunday with no Saturday before it, or a trailing Saturday with no Sunday after it, is not a weekend.
- `weekendLayout.next` is the first pair with a `left` day and no `today` day, so a weekend in progress never reads as the next one.
- Home plate order is fixed: year in days, year in weekends, your summers left, grandparents visits left. The two personal plates stay at the bottom, summers first.
- Horizons are per plate and editable in the caption (`summers.horizon`, `visits.horizon`). Summers count from birth and visits from `LEAD_YEARS` before today's age, clamped at 0; both draw those years spent. Never hard-code 85 outside `DEFAULT_HORIZON`.
- 2026 lays out in 53 columns; 2028 needs 54.
- `yearLayout` must keep leading and trailing blanks so months stay aligned.
- `--ink-dim` is not a general-purpose muted color. It is for `/support` only.
- localStorage is the only persistence. No cookies, analytics, or app data requests; a dependency that adds any of these is out of scope. The footer must keep saying it saves in this browser.
- Do not edit `/Users/nioni/Documents/work/introspect`.

## Before committing

- `npm test`, `npm run lint`, and `npm run build` pass.
- Update `DESIGN.md` when the visual system, chart rules, or asset workflow changes.
- Do not commit `dist/`; it is ignored.
