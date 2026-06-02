# Design system

> The visual language used across this site — flashcards, interactive diagrams, landing pages.

The system extends what was already in `AWS/shared/styles.css` (Inter + indigo accent, soft shadows, light/dark via CSS variables) with a few additions inspired by **Vercel**'s and **Sanity**'s technical-doc systems: a monospace technical eyebrow (JetBrains Mono), explicit semantic state colors for diagrams, and reusable layout primitives.

## Files

```
/assets
  design.css     ← tokens + base components (typography, header, buttons, cards, flashcards)
  diagrams.css   ← SVG diagram styles (nodes, arrows, log, verdict pills)
  theme.js       ← light/dark toggle + system-pref default
  flashcards.js  ← flashcard runtime (uses theme.js)
  DESIGN.md      ← this file
```

Pull `design.css` into every page. Add `diagrams.css` only on pages that render an interactive diagram.

```html
<link rel="stylesheet" href="/path/to/assets/design.css">
<link rel="stylesheet" href="/path/to/assets/diagrams.css"><!-- diagrams only -->
<script src="/path/to/assets/theme.js"></script>
```

## Type

| Use | Font | Weight |
| --- | --- | --- |
| Body, headings | `Inter` | 400, 500, 600, 700 |
| Code, eyebrows, monospaced labels (line numbers, kbd, tags) | `JetBrains Mono` | 400, 500 |

Two font weights per surface, not more. Eyebrows + numeric labels use mono — that's the technical-doc accent borrowed from Vercel/Sanity.

## Color tokens

All colors are CSS custom properties on `:root` with a `[data-theme="dark"]` override. Reference them by token, never by hex.

### Surfaces & text

```
--bg              page background
--surface         elevated panels, cards
--surface-2       subtler fill (table rows inside a panel)
--border          default 1px borders
--border-strong   borders that should read (controls, node outlines)

--text            primary
--text-secondary  body copy on dark surfaces
--text-muted      captions, helper text
```

### Accent (indigo)

```
--accent           #6366f1 (light)  /  #818cf8 (dark)
--accent-hover     hover/active state
--accent-soft      tinted background for badges, tags
--accent-soft-text legible foreground on --accent-soft
```

### Semantic state (diagrams)

These encode *meaning*. Don't reuse for decoration.

```
--state-idle        gray  (default/inactive)
--state-pending     amber (in-flight)
--state-success     green (committed / done / free)
--state-danger      red   (failed / inconsistent)
--state-locked      orange (2PC participant holding locks)
--state-comp        purple (compensating)
--state-warn-*      amber pills for queued/blocked work
```

### Verdict pills (under diagrams)

```
.verdict.neutral   default — describes the setup
.verdict.good      green — the mechanism worked
.verdict.bad       red   — the mechanism broke; here's why
.verdict.warn      amber — works, but with a caveat
```

## Radii

```
--radius-sm   6px   inputs, small chips
--radius-md  10px   buttons, controls, code blocks
--radius-lg  14px   panels, cards
--radius-xl  16px   flashcard faces
--radius-pill 999px badges/tags
```

## Components

### Header

Every page uses the same header pattern:

```html
<header>
  <div class="breadcrumb"><a href="../..">… /</a> Distributed Transactions</div>
  <h1>Saga order flow with compensation</h1>
  <p>One-sentence description.</p>
  <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()"></button>
</header>
```

The optional `.eyebrow` (small uppercase mono label above `<h1>`) is for category badges.

### Buttons

```html
<button class="btn">Default</button>
<button class="btn primary">Primary action</button>
<button class="btn danger">Destructive (e.g. "Crash coordinator")</button>
<button class="btn ghost">Tertiary</button>
```

Add `disabled` for disabled state — the system handles opacity + cursor.

### Segmented control

```html
<div class="seg" role="tablist">
  <button aria-pressed="true">Naive</button>
  <button aria-pressed="false">Outbox</button>
</div>
```

Toggle `aria-pressed` from JS; CSS does the rest.

### Link card grid

For landing pages that list child sections:

```html
<div class="card-grid">
  <a class="link-card" href="01-saga-order-flow.html">
    <span class="lc-tag">5 controls</span>
    <div class="lc-title"><span class="lc-num">01</span> Saga order flow</div>
    <p class="lc-desc">One-line description.</p>
  </a>
</div>
```

Add `cols-2` to the grid for a multi-column layout.

### Diagram stage

```html
<div class="stage">
  <h2>2PC <span class="tag">strong consistency, blocking</span></h2>
  <p class="note">Explanatory caption.</p>
  <svg class="diagram" viewBox="…" role="img" aria-labelledby="t d">…</svg>
  <div class="verdict neutral">Click <b>run</b> to begin.</div>
</div>
```

### Diagram controls

```html
<div class="dctrl">
  <button class="btn primary">Run</button>
  <button class="btn danger" disabled>Crash</button>
  <label><input type="checkbox"> Toggle</label>
</div>
```

### Diagram nodes (in SVG)

```html
<g class="node" id="svc-a" data-state="idle">
  <rect class="node-bg" x="…" y="…" width="…" height="…" rx="10"/>
  <text class="node-title" …>Service A</text>
  <text class="node-sub" …>orders DB</text>
  <circle class="status-dot" …/>
  <text class="status-text" …>idle</text>
</g>
```

Drive state by setting `data-state` from JS. Valid values: `idle | running | active | committed | done | free | locked | failed | compensating | compensated | crashed | recovering`. The CSS handles colors, animations, and icon visibility.

### Arrows

```html
<path class="arrow" d="M… L…"/>
```

Set `data-state="active|good|bad|comp|crashed"` to color/dash the arrow. Use the shared marker pattern (define one `<marker>` per SVG) and set `marker-end="url(#…)"`.

## Theme

`theme.js` initializes the theme from `localStorage` (`site-theme` key) and falls back to `prefers-color-scheme` on first visit. `toggleTheme()` flips it.

Pages should include a tiny `<script>` in `<head>` to set `data-theme` *before* first paint to avoid a flash:

```html
<script>
  try {
    const s = localStorage.getItem('site-theme');
    if (s === 'dark' || (!s && matchMedia('(prefers-color-scheme: dark)').matches))
      document.documentElement.setAttribute('data-theme', 'dark');
    else if (s === 'light')
      document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {}
</script>
```

(This logic also runs inside `theme.js` for browsers that load it before render — the inline copy is just belt-and-suspenders against FOUC.)

## Motion

- Transitions ≤ 250ms for state changes (colors, borders); 500ms for the flashcard flip.
- Loops ≤ 2s (the diagram pulse and relay pulse).
- All animations honor `prefers-reduced-motion: reduce` — the global rule in `design.css` and `diagrams.css` zeros them out.

## Accessibility

- Every interactive control is a real `<button>` or `<input>`. No clickable divs.
- Every SVG diagram has `role="img"`, a `<title>`, and a `<desc>`.
- Log panels use `role="log"` + `aria-live="polite"`.
- Color encodes meaning — but state is also signaled by text and shape (dashed strokes, icons), so colorblind users aren't excluded.
