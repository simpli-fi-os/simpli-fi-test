# Simpli-FI ID: Design System

> Visual language specification for consistent UI across all pages.

---

## Brand Identity

**Voice:** Warm, encouraging, direct — never corporate.
**Visual Philosophy:** Clean and professional with warmth. Navy conveys trust. Gold celebrates achievement. Premium but never cold.

---

## Color Palette

### Primary Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Navy | `#1e293b` | `--color-primary` | Headers, primary buttons, text |
| Gold | `#fbbf24` | `--color-accent` | CTAs, achievements, highlights |
| Periwinkle | `#98A6D4` | `--color-pop` | Secondary links, hover states |
| Warm White | `#FBF9F7` | `--color-canvas` | Page backgrounds |
| White | `#FFFFFF` | `--color-surface` | Cards, panels, modals |
| Teal | `#0d9488` | `--color-teal` | Founder tier card, accents |
| Coral | `#f87171` | `--color-coral` | Ambassador tier accent |

### Semantic Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Success | `#22c55e` | `--color-success` | Achievements, form success |
| Danger | `#ef4444` | `--color-danger` | Errors, destructive actions |
| Warning | `#f59e0b` | `--color-warning` | Pending states |
| Info | `#3b82f6` | `--color-info` | Info banners, help text |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#1e293b` | Headings, body |
| Text Secondary | `#64748b` | Captions, labels |
| Text Inverted | `#FFFFFF` | On dark backgrounds |
| Text Disabled | `#94a3b8` | Disabled inputs |

---

## Product Tier Visual Treatment

Each product tier has a distinct visual identity on the pricing page and cards:

| Tier | Card BG | Badge BG | Badge Text | Accent Color |
|------|---------|----------|-----------|-------------|
| Ambassador | White | `coral/10` | Coral `#f87171` | Coral gradient top |
| Professional | Navy `#1e293b` | `white/10` | White | Navy (dark card) |
| Founder | Teal `#0d9488` | `white/20` | White | Teal gradient top |
| Enterprise | Purple `#7c3aed` | `white/20` | White | Gold + purple gradient |

### Tier Badge CSS

```css
.tier-badge { display: inline-flex; padding: 4px 10px; border-radius: 9999px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.tier-badge.ambassador    { background: rgba(248,113,113,0.1); color: #f87171; }
.tier-badge.professional  { background: #1e293b; color: #ffffff; }
.tier-badge.founder       { background: #0d9488; color: #ffffff; }
.tier-badge.enterprise    { background: #7c3aed; color: #ffffff; }
```

### "Popular" Badge

The Professional tier displays a "POPULAR" badge (gold bg, navy text) positioned above the card.

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* admin tools only */
```

Load Inter via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Display | 48px | 700 | 1.1 |
| H1 | 32px | 700 | 1.2 |
| H2 | 24px | 600 | 1.3 |
| H3 | 20px | 600 | 1.4 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 500 | 1.4 |
| Overline | 11px | 700 | 1.2 (uppercase, tracked) |

---

## Spacing

Base unit: 4px. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

---

## Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| sm | 4px | `rounded` | Badges, chips |
| md | 8px | `rounded-lg` | Inputs |
| lg | 12px | `rounded-xl` | Buttons |
| xl | 16px | `rounded-2xl` | Cards, modals |
| full | 9999px | `rounded-full` | Avatars, pills |

---

## Shadows

| Level | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | Inputs |
| md | `0 4px 12px rgba(0,0,0,0.08)` | Cards |
| lg | `0 8px 24px rgba(0,0,0,0.10)` | Modals |
| xl | `0 12px 32px rgba(0,0,0,0.12)` | Hero cards |

---

## Component Patterns

### Buttons

**Primary**: Navy bg, white text, rounded-xl, 12px 24px padding, font-weight 600.
**CTA/Accent**: Gold bg, navy text.
**Ghost**: Transparent bg, navy text, 1px border.

### Cards

White bg, rounded-2xl, 24px padding, shadow-md.

### Inputs

White bg, 1px slate-200 border, rounded-lg, 10px 14px padding.
Focus: navy border + 3px navy/10 ring. Error: red border.

### Velvet Rope (Locked Feature)

Locked features show grayed-out with blur overlay and a lock badge:

```css
.velvet-rope { opacity: 0.7; pointer-events: none; filter: grayscale(1); position: relative; }
.velvet-rope::after { content: ''; position: absolute; inset: 0;
  background: rgba(255,255,255,0.4); backdrop-filter: blur(1px); z-index: 10; }
.lock-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  z-index: 20; background: #1e293b; color: #fbbf24; padding: 6px 12px;
  border-radius: 9999px; font-size: 10px; font-weight: 700; cursor: pointer; }
```

---

## Responsive Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| Mobile | < 640px | Single column. Card UI primary target (375px). |
| Tablet | 640–1024px | Two columns where appropriate |
| Desktop | > 1024px | Full layout with sidebar |

Mobile-first: card.html is primarily scanned on phones.

---

## Admin / Ops Tools

Admin interfaces use a dark theme: Navy bg, green text (#22c55e), monospace font, CRT aesthetic. Same brand colors but inverted. Deliberate contrast from warm user-facing pages.

---

## Iconography

**Library:** Lucide 0.294.0 via CDN
**Init:** `document.addEventListener('DOMContentLoaded', () => lucide.createIcons());`
**Usage:** `<i data-lucide="user" class="w-5 h-5"></i>`

Common: user, qr-code, trophy, mail, phone, globe, linkedin, lock, pencil, download, share-2, crown (for tier badges).

---

## CSS Custom Properties (shared.css)

```css
:root {
  --color-primary: #1e293b;
  --color-accent: #fbbf24;
  --color-pop: #98A6D4;
  --color-canvas: #FBF9F7;
  --color-surface: #FFFFFF;
  --color-teal: #0d9488;
  --color-coral: #f87171;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-success: #22c55e;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-border: #e2e8f0;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px;
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
}
```
