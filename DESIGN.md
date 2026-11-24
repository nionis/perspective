# Perspective design system

Perspective is one dark, monochrome page where the year is the interface. The grid is the content, not decoration beside it. The home page is a stack of charts: the year grid first and primary, then weekends, visits, and summers. Keep the page almost wordless.

Read this before changing tokens, type, chart geometry, the Support page, or the social card.

## Palette

Everything is declared once in `src/index.css`. Components use tokens only, never raw color values.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0a0a0a` | Page field |
| `--ink` | `#f2eee6` | Text, days left, today ring |
| `--ink-muted` | `#a39e95` | Labels, meta, footer |
| `--ink-dim` | `#8f8a82` | Support page only |
| `--line` | `#242424` | Hairline plate and footer rules |
| `--line-strong` | `#3a3a3a` | 2px progress track, field underline |
| `--cell-spent` | `#2e2e2e` | Spent day and weekend cells |

Measured text contrast on `--bg`: `--ink` 17.11:1, `--ink-muted` 7.43:1, `--ink-dim` 5.78:1.

Rules:

- Bone means what is left. Gray means what is spent. An outline means today. Keep that mapping in the grid and legend.
- No second hue. No gradients, glows, grain, drop shadows, or transparency effects. The single `box-shadow` in the system is the inset today ring.
- `--ink-dim` belongs to `/support` only. The footer stays `--ink-muted`.
- Do not add a token for one component. If a role is missing, name the role, then add it here and in `src/index.css`.
- `--ink` on `--cell-spent` measures 11.74:1, so the today ring stays visible when it lands on a spent cell.

## Type

Two families, self-hosted through `next/font` in `src/app/layout.tsx`.

| Role | Face | Size and weight |
| --- | --- | --- |
| Page title (`/support`) | Inter Tight | `clamp(2.25rem, 6vw, 3.25rem)`, 700, tracking -0.03em |
| Body | Inter Tight | 16px, 400, line-height 1.5 |
| Support lead | Inter Tight | 17px, 400, line-height 1.5, max 34ch |
| Plate title and meta | IBM Plex Mono | 11px, 400, uppercase, tracking 0.12em (title) or 0.08em (meta) |
| Legend, caption, footer | IBM Plex Mono | 11px, 400, tracking 0.04em |
| Supporter name | Inter Tight | 14px, 400 |
| Supporter amount and handle | IBM Plex Mono | 11px, 400 |

Rules:

- Write copy in sentence case. Uppercase is a CSS treatment, not text.
- Put `font-variant-numeric: tabular-nums` on every number that can change.
- Cap prose with `--max-read` and a character measure. Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- The home page stacks four plates: the year grid, weekends, your summers, then visits. The year grid comes first and stays the primary content.
- Plate meta counts are 11px mono statistics, not hero numbers. Never promote a count into display type.

## Layout

Tokens: `--max-page` 75rem, `--max-read` 36rem, `--gutter` `clamp(1rem, 4vw, 3rem)`.

```
header  Perspective                         NOV 23, 2026
──────────────────────────────────────────────────────────
        THE YEAR, IN DAYS                        365 DAYS
        [ weekday gutter | 53 x 7 grid ]
        spent  left  today
──────────────────────────────────────────────────────────
        THE YEAR, IN WEEKENDS                       5 LEFT
        [ 13 x 4 grid of Saturday/Sunday pairs ]
──────────────────────────────────────────────────────────
        YOUR SUMMERS LEFT                         10 SUMMERS
        YOUR AGE
        75
        [ unit grid, one square a summer ]
        One block a summer · until age [85]
──────────────────────────────────────────────────────────
        GRANDPARENTS VISITS LEFT                240 VISITS
        THEIR AGE  VISITS A MONTH
        75         2
        [ unit grid, one square a visit, gray for the lead years ]
        2 visits a month · age 70 to [85]
──────────────────────────────────────────────────────────
footer  Saved in this browser only.      Stavros   Support
```

- The plate has a 1px `--line` top rule and `padding-block: clamp(3rem, 8vh, 6.5rem)`. Every plate on the home page uses it; there is no compact variant.
- A plate head is a label on the left and, on the right, one mono statistic plus the share trigger, 1.5rem above the chart or fields. That gap lives in the plate, not in each chart, so all four plates match.
- Every chart spans the plate width: the year grid, the weekend grid, and both unit grids. Nothing is capped at a pixel width; a chart pinned to its natural size inside a wide plate reads as zoomed out.
- Fields and captions sit in that same column. Their values are short, so the plate width does not stretch them.
- `/support` is a single centered `--max-read` column. Body, headings, track fill, and supporter meta use `--ink-dim`; only the `Support us ↗` action uses `--ink`.
- The grid scroller owns horizontal overflow. The page never scrolls sideways.
- Pages fill `100dvh`; header, footer, and mains pad inline with `max(var(--gutter), env(safe-area-inset-*))`, and the viewport meta is `viewport-fit=cover`.

## Chart language

`src/time.ts` owns the data. Components receive it; they never read the clock.

- `yearLayout(today)` returns the year, the weekday of 1 January (0 = Sunday), the column count, and one status per day.
- The grid fills its container. Cell size is clamped between 10px and 22px from the column count, gaps stay 3px, the weekday gutter is 2rem, and the month row has a 2.5rem left offset so labels line up with the first column. It is Sunday-first. Columns are `ceil((startWeekday + days) / 7)`, which is 53 in 2026 and 54 in 2028.
- Leading and trailing blanks keep the calendar aligned. Do not drop them to save space.
- Mon, Wed, and Fri labels sit on rows 2, 4, and 6 of the Sunday-first grid.
- The grid is `role="img"` with a single label that states the counts and today's date. Cells, month labels, and weekday labels are `aria-hidden`.
- The scroller is focusable (`tabIndex=0`, `role="group"`, label "Year grid") and shows a 2px `--ink` focus ring at 4px offset.
- On mount the scroller opens with today in view: it centers today's column only when that cell would otherwise be clipped; with the full year visible it stays at January. The scroll is instant.
- The legend below the scroller is text, not color swatches alone.

### Weekends

- `weekendLayout(layout)` walks the year layout and returns complete Saturday+Sunday pairs. A leading Sunday with no Saturday before it, or a trailing Saturday with no Sunday after it, is not a weekend.
- A weekend is spent only when both days are spent, so today counts as left, exactly as in the year grid.
- 13 columns that fill the plate width: 6px between pairs, 2px inside a pair, square cells from `aspect-ratio: 1`. Cells scale with the column, so a weekend day reads at 38px on a 1440 screen and 9px on a phone. Never let the block sit at a fixed size in a wide plate, and never give it a scroller.
- 52 pairs fill four rows; a 53rd weekend wraps alone.
- Spent cells use `--cell-spent`, left cells use `--ink`, and the today cell uses the same inset `--ink` ring as the year grid.
- The next weekend, the first pair still entirely ahead, gets a 1px dotted `--ink` box at 2px offset. A weekend you are already inside keeps only the today ring, so the dotted box always means the one to come. Never signal it with color: the fill mapping stays spent, left, today.
- No second legend. The year grid's legend directly above is the mapping for the page.
- The chart is `role="img"` with one label stating the total, spent, and left counts, plus the start date of the next weekend when there is one. Pairs and cells are `aria-hidden`.

### Unit grids

- `UnitGrid` turns a count into squares: one square per visit or per summer. It is the only place a count becomes geometry.
- The grid is as wide as the plate, always. No `max-width`, no fixed cell size, no scroller: the cell is whatever the column count leaves in the plate width. A unit grid that sits at its natural size in a wide plate is a bug, not a thumbnail.
- Columns are `max(26, ceil(sqrt(count * 4)))`. The 26 floor matches the 26 weekend cells across the plate, so a small count draws its squares at the weekend cell size and leaves the rest of the row empty instead of inflating a few squares to fill it. Above about 169 units the 4:1 term takes over and the block stays roughly four times as wide as tall.
- Both unit grids keep a spent band. Summers draw one square a year from birth: the years already lived are `--cell-spent`, the rest bone, so the block is always 85 squares. Visits draw the five lead years in `--cell-spent` and the rest bone. The year grid's legend above is the mapping for the page, so the unit grids carry no legend of their own.
- The gap is proportional, 0.14 of a cell, so a square dot field never turns into a solid block or a broken layout.
- The last row is clipped to the exact count, so 79 summers draws three full rows of 26 and a single square on the fourth.
- One SVG pattern per color draws the field, clipped to the counted cells. The grid is a fixed handful of nodes whether the count is 12 or 24,924, so a keystroke never costs a full re-layout.
- Callers never render a zero-count grid; a zero count shows the empty-state sentence instead.

### Fields

- Field labels are 10px mono uppercase at 0.08em tracking. Values are 18px Inter Tight with tabular numerals.
- The underline is 1px `--line-strong`, with no box, radius, or fill. Spinners are removed; the value is typed.
- Focus is the global 2px `--ink` `:focus-visible` ring. Do not add a local outline.
- The horizon is an `InlineNumber` inside the caption, where the age is printed: 3ch, mono, `--ink`, the same 1px `--line-strong` underline, `0–120`. It is the only inline control, it exists once per plate, and it is never moved into the field row. On coarse pointers the inline horizon is 16px in a 44px hairline box so iOS does not zoom; desktop keeps 11px / 3ch.
- Every value is saved: `useStoredState` writes each field and horizon to localStorage under `perspective:` on change and reads it back on first render. Nothing is written on mount, and nothing goes to a log or the network.
- A share link carries values in the URL, but only as a read-only view: never written to storage, never restored after dismissal.

## Motion

One mount animation: `.plate` rises 10px and fades over 550ms, only inside `@media (prefers-reduced-motion: no-preference)`. Every plate on the home page runs it on mount. Input changes do not animate: the unit grid appears and the counts change without transition. Share focus, dismissal, and the menu do not animate either — dimming is an instant opacity change and the menu appears without a transition. No count-up, no hover movement, no progress animation, no parallax.

## Copy

- Lead with the data. Labels are nouns, not sentences.
- No productivity promises. The visits and summers plates may estimate time left, but every caption prints the horizon it uses and the copy never presents the number as a prediction.
- The page stays almost wordless: titles and labels are nouns. The functional input prompt and the estimate caption are the only prose.
- Both estimate plates open on a drawn chart on a first visit: visits on 75 and 2 a month, summers on age 0. After that they restore whatever was saved, horizons included. Every field is editable and saved in this browser. Clearing a field leaves the plate as its head and fields, with no instructional sentence; only a rejected entry explains the accepted range.
- Visits are the reader's visits to their grandparents. The plate title is `Grandparents visits left`; keep the wording concrete and never turn it back into a generic "visits left".
- Visits are per month. The copy says `visits a month` in the field label, the caption, and the chart label, never per year.
- Visits start five years before the grandparent's age, clamped at 0, and run to the horizon. Those five years are drawn spent at the same rate; the rest is left. The caption names the window (`age 70 to 85`), so the gray reads as a rate applied backwards, not as a record of real visits. Past that five-year lead, never word a longer history, and never present the rate as a prediction.
- Summers are the reader's own: one square a year from birth to the horizon, gray for the summers lived and bone for those left. The plate title is `Your summers left` and the field is `Your age`, because this is the reader's countdown; the visits plate is about someone else and asks `Their age`. No childhood deadline, no second horizon, and no prose beyond the horizon line.
- Product name is always Perspective.
- Footer copy is exactly "Saved in this browser only.", the Stavros credit, and the Support link. The Support link opens `https://introspect.school/#donate-heading` in a new tab; it does not point at `/support`.
- Support copy: eyebrow `{year} goal`, heading `Support`, lead about free access and the hosting goal.

## Assets and metadata

- `public/favicon.svg` is the mark: 32×32 black field, bone block P. Do not add a gradient or a second shape.
- `design/og.svg` is the source of `public/og.png` (1200×630). It repeats the site language: mono top row, two-line title, spent/bone tick band, mono bottom row.
- The bottom-right label is the production host in uppercase with no scheme (`PERSPECTIVE-NIONI.VERCEL.APP`). Share cards read the host from `SITE_URL`; this static card does not, so changing the origin edits `design/og.svg` and re-rasterizes `public/og.png` in the same pass.
- `public/apple-touch-icon.png` is 180×180, rendered from the favicon.
- Regenerate raster assets from the SVG at an exact viewport, then verify dimensions:

```bash
# Render design/og.svg at 1200x630 and public/favicon.svg at 180x180 in a browser,
# save the screenshots, then:
sips -g pixelWidth -g pixelHeight public/og.png public/apple-touch-icon.png
```

To automate the capture, set the viewport to 1200×630, open the SVG, and call `page.screenshot({ path: "public/og.png", type: "png" })`. Repeat for the favicon at 180×180, then run `sips -z 180 180 public/apple-touch-icon.png` if the device pixel ratio produced a larger file.

Do not use `qlmanage` alone for the card. It pads the thumbnail to a square, so the 1200×630 output becomes 1200×1200. The browser screenshot at an exact viewport is the reliable path.

- `src/app/layout.tsx` owns the base metadata through the Next Metadata API: title, description, canonical, Open Graph, Twitter, icons, theme color. There is no hand-written `<head>`.
- Use the production origin `https://perspective-nioni.vercel.app/` (or `NEXT_PUBLIC_SITE_URL`) in canonical and social URLs through `metadataBase`. `og:url` matches canonical, and `og:image` is absolute.
- A valid share URL gets its own server-rendered metadata: title, description, canonical, `og:url`, `og:image`, and `twitter:image`, all from `src/share/metadata.ts`. The social preview is a server response, never client JavaScript.
- `public/og.png` is the default card. Valid shares point at `/api/og` instead, which renders the same chart the plate shows.

## Share card

The card is 1200×630, drawn with `ImageResponse` in `src/app/api/og/card.tsx`. It is the one place raw hex is allowed, because it renders outside CSS; the values mirror the tokens.

| Constant | Value | Use |
| --- | --- | --- |
| `BG` | `#0A0A0A` | Field |
| `INK` | `#F2EEE6` | Left cells, today ring |
| `MUTED` | `#A39E95` | Every label and line of text |
| `LINE` | `#242424` | The hairline |
| `SPENT` | `#2E2E2E` | Spent cells |

- Margins are 72px, content width 1056px. Top row: `PERSPECTIVE` left, the plate title right, 18px mono at 0.17em tracking.
- The chart fills a 330px band, centered. The days card draws the same 7-row calendar with month labels, the weekday gutter, and the legend. The weekends card draws 13 columns of pairs with the dotted next-weekend box. The unit cards draw the same pattern-filled grid, scaled to fit.
- A personal chart with nothing left shows its empty sentence centered, never an empty grid.
- Under the chart: a 1px `LINE` hairline, then the plate meta left and the image caption right, then the share line left and the site host right, all mono and uppercase.
- The card uses IBM Plex Mono regular from `src/app/api/og/IBMPlexMono-Regular.ttf`, licensed under `src/app/api/og/OFL.txt`. It must stay traced into the function in `next.config.ts`.
- Days and weekends image URLs carry `d=YYYY-MM-DD` so the card is deterministic for that day. The share URL itself never carries `d`.

## Share control

- One trigger per plate head, 1.75rem square, a 16px two-rect currentColor icon, `--ink-muted`, `--ink` on hover or open. It sits after the meta, 0.75rem apart.
- The menu is `--bg` with a 1px `--line-strong` border, no radius, no shadow, 9.5rem minimum, opening below the trigger and aligned right. Items are 11px mono `--ink-muted`, `--ink` and underlined on hover and focus.
- The status line is 10px mono `--ink-muted` directly under the trigger, absolutely positioned so it never moves layout, cleared after 2.5s.
- On coarse pointers the trigger is a 44px box pulled back by a negative margin, and menu items are 44px tall.
- Focus mode: the focused plate stays at opacity 1 and every other plate drops to `0.4`, instantly. Scrolling more than 30% of the viewport height away from the plate ends focus mode and restores every plate to full opacity. The focused plate centers in the viewport when it fits and the page can scroll that far; the first plate stays near the top and the last is capped by the document end. An outside press, an outside focus, Escape, or a field edit dismisses it.
- Dismissal returns the viewport to where it was before the share scroll, so the page reads as the normal page from the top. A field edit or a scroll dismissal keeps the viewport in place.
- No count, no badge, no tooltip beyond `title="Share"`, no confirmation toast.

## Before you merge a visual change

- [ ] `npm test`, `npm run lint`, `npm run build` pass.
- [ ] 1440×900 and 375×812 both look intentional; no page-level horizontal scroll.
- [ ] The grid label and legend report the same spent and left numbers.
- [ ] The weekend chart counts only complete Saturday+Sunday pairs, and 2026 reads 52 weekends with 5 left on 23 November.
- [ ] Every field and both horizons survive a reload, read from localStorage keys prefixed `perspective:`; clearing site data restores the defaults. No cookies, sessionStorage, or network writes, and a first visit writes nothing.
- [ ] A share URL shows its values, dims the other plates, and writes nothing; dismissing, editing, or scrolling away clears the URL, restores the saved values, and unhides the page.
- [ ] `/api/og` returns a 1200×630 card matching the plate, and the share page's metadata points at it.
- [ ] 75 and 2 reads `240 visits` with 120 spent squares and 240 left; 85 reads `0 visits` with the empty state, never a negative count.
- [ ] The largest grid (age 0, 31 visits a month) stays inside the page and never scrolls the page sideways.
- [ ] Today is outlined in the grid.
- [ ] Tab order reaches the grid scroller, the estimate fields, and the footer links; focus rings are visible and the chart grids are not tab stops.
- [ ] `/support` is dim except the action; the footer is not.
- [ ] No new color, radius, shadow, gradient, or animation was introduced.
