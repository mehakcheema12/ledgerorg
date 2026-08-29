# Ledger — build plan & design system

## Phase status

- [x] Phase 1 — Scaffold + design tokens
- [x] Phase 2 — Backend core (models, auth, streak logic, CRUD, analytics)
- [x] Phase 3 — Frontend foundation (landing, auth, protected routes)
- [x] Phase 4 — Dashboard + habit management
- [x] Phase 5 — Calendar + analytics
- [x] Phase 6 — Polish (empty/loading states, dark mode, mobile, micro-interactions)

## Design system

### Concept

Premium, editorial, slightly experimental — closer to a well-funded consumer app
than a SaaS dashboard. Dark-first (matches the "properly designed dark mode,
not inverted" requirement), with a warm off-white light mode as the alternate.
The signature element is **the flame**: a custom SVG streak-flame that grows,
flickers, and bursts into small sparks on completion — reused as a motif across
the dashboard, habit cards, and landing hero, instead of a generic progress
ring as the hero visual.

### Color tokens

Dark (default):
- `bg` `#0E0E12` — base background, near-black with a warm-cool balance
- `surface` `#17171D` — card surface
- `surface-raised` `#1E1E26` — elevated cards / modals
- `border` `#2A2A34` — hairline borders
- `text` `#F4F2ED` — primary text, warm off-white
- `text-muted` `#9C99A8` — secondary text
- `accent-lavender` `#B9A6FF` — primary actions, focus, streak indicators
- `accent-coral` `#FF8B6B` — completion / celebratory states
- `accent-mint` `#6FE3B4` — success / positive analytics
- `accent-blue` `#7CA6FF` — links, info, secondary category color

Light (alternate):
- `bg` `#FAF7F2`
- `surface` `#FFFFFF`
- `surface-raised` `#FFFFFF` (with shadow)
- `border` `#E7E2D9`
- `text` `#1B1A1F`
- `text-muted` `#6B6875`
- accents deepened slightly for contrast: `#8A6FEA`, `#E96B47`, `#2FAE7E`, `#4C7EE0`

### Typography

- Display: **Fraunces** (variable, optical sizing) — headings, big numbers, hero copy. Has personality without being the cliché AI-serif pairing (used dark, not on cream).
- Body: **General Sans** — clean grotesk, highly readable at small sizes.
- Data/mono: **Space Mono** — streak counts, stats, dates. Gives numbers a distinct "counter" identity.

### Layout signature

Asymmetric hero on the landing page: an offset stack of 3 tilted habit cards
with a flame-trail line connecting them, rather than a centered headline +
stock illustration. Dashboard uses a 2-column asymmetric grid (today's focus
card larger, habit list beside it) rather than a uniform card grid.

### Motion

Fast, purposeful only: card completion (check + flame flicker + subtle scale),
modal enter/exit, route transitions (fade + 8px slide). No ambient/idle
animation loops — performance and restraint over decoration.
