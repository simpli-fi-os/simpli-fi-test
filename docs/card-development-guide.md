# Simpli-FI ID: Card Development Guide

> Everything learned about building and maintaining showcase card HTML files. Read this before modifying any card in `/public/cards/`.

---

## Card Architecture Overview

Each showcase card (`/public/cards/{name}.html`) is a **self-contained, static HTML file** with two views:

```
┌─────────────────────────────────────────────┐
│ 1. COMPACT VIEW (Simple Card)               │
│    - Horizontal/landscape card (650×370px)   │
│    - Scales to fit viewport                  │
│    - Physics effects (dollar bills, coins)   │
│    - Visible by default (no .show-full)      │
│    - Contains: logo, name, title, contact    │
│      grid, profile photo, save button        │
│                                              │
│ 2. FULL VIEW (Scrollable)                    │
│    - Vertical mobile-style card              │
│    - Full profile with bio, mission,         │
│      highlights, socials, about section      │
│    - Toggled via FAB button (+/-)            │
│    - Action icons: Call, Email, Site, Save    │
└─────────────────────────────────────────────┘
```

### View Switching

- Default state: compact view visible, full view hidden
- `body.show-full` class toggles between views
- FAB button (`#toggle-view-btn`) calls `toggleView()`
- Transitions use opacity + pointer-events (0.5s ease)

```css
/* Default: compact visible, full hidden */
#simple-view-container { z-index: 10; opacity: 1; pointer-events: auto; }
#full-view { z-index: 20; opacity: 0; pointer-events: none; }

/* .show-full: compact hidden, full visible */
body.show-full #simple-view-container { opacity: 0; pointer-events: none; }
body.show-full #full-view { opacity: 1; pointer-events: auto; }
```

---

## Compact View (Simple Card) Specifications

### Card Dimensions & Scaling

```css
#card-wrapper {
    width: 650px;
    height: 370px;
    transform-origin: center center;
}
```

The card scales to fit the viewport via `resizeCard()`:

```javascript
function resizeCard() {
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 40;
    const scaleX = availableWidth / 650;
    const scaleY = availableHeight / 370;
    baseScale = Math.min(scaleX, scaleY, 1); // Never exceed 1x
    updateTransform();
}
```

**Critical resize listeners** (all three required for cross-device support):
```javascript
window.addEventListener('resize', resizeCard);
window.addEventListener('orientationchange', () => setTimeout(resizeCard, 100));
window.addEventListener('load', resizeCard);
```

> **iOS Note:** The `orientationchange` listener with 100ms `setTimeout` is required because iOS doesn't immediately update `window.innerWidth/Height` on rotation.

### Layout Structure

```
┌──────────────────────────────────────────────┐
│ LEFT SIDE (w-2/3, p-10)  │ RIGHT SIDE        │
│                           │ (w-1/3, bg-primary)│
│ ┌─────────┬──────────┐  │                     │
│ │ Logo    │ Company  │  │   ┌──────────┐      │
│ │ (64px)  │ Name     │  │   │  Profile  │      │
│ └─────────┴──────────┘  │   │  Photo    │      │
│                           │   │ (w-36 h-36)│    │
│ Name (5xl font)          │   └──────────┘      │
│ Title (sm, tracked)      │                     │
│                           │   [Save Contact]   │
│ ┌──────────┬──────────┐ │                     │
│ │ 📞 Phone │ 📧 Email│ │                     │
│ └──────────┴──────────┘ │                     │
└──────────────────────────┴─────────────────────┘
```

### Right Side Sizing Constraints

The right column is `w-1/3` of 650px ≈ **217px** with `pl-6 pr-4` padding (40px total), leaving **~177px** for content.

**Profile photo circle: `w-36 h-36` (144px)** — fits within 177px with room to breathe.

> ⚠️ **DO NOT use `w-48 h-48` (192px)** — it exceeds the available 177px and causes the circle to squish/clip.

### Contact Grid (Compact View)

Two-button grid with phone on left, email on right:

```html
<div class="grid grid-cols-2 gap-3 w-full">
    <a href="tel:..." class="px-2 py-3.5 rounded-xl bg-brand-surface shadow-neu-pressed
       flex items-center justify-center gap-1.5 ... overflow-hidden min-w-0">
        <i data-lucide="phone" class="w-3.5 h-3.5 text-brand-primary shrink-0"></i>
        <span class="text-[11px] font-bold text-brand-primary truncate">PHONE</span>
    </a>
    <a href="mailto:..." class="... overflow-hidden min-w-0">
        <i data-lucide="mail" class="w-3.5 h-3.5 text-brand-primary shrink-0"></i>
        <span class="text-[11px] font-bold text-brand-primary truncate">EMAIL</span>
    </a>
</div>
```

**Overflow prevention** (required on all contact buttons):
- `overflow-hidden min-w-0` on the `<a>` tag
- `truncate` on the `<span>` (combines overflow-hidden + text-ellipsis + whitespace-nowrap)
- `shrink-0` on the icon to prevent it from being crushed

> **Kevin Harrington exception:** Has website (globe icon) instead of phone (no public phone number).

### Logo Display

Logos are shown in the compact view header. If the logo image is circular on a square canvas (like Simpli-FI Alpha's logo), use:

```html
<div class="w-16 h-16 shrink-0 rounded-full bg-brand-surface shadow-neu-flat
     flex items-center justify-center ... overflow-hidden">
    <img src="..." class="w-full h-full object-cover drop-shadow-sm">
</div>
```

- `rounded-full` clips the container to a circle
- `object-cover` fills the circle (vs `object-contain` which shows white corners)
- For text-only logos (initials), use a `<span>` with Playfair Display serif font

---

## Full View (Scrollable) Specifications

### Action Icons Section

Action icons (Call, Email, Site, Save, Catalog) use **flex layout for even spacing**:

```html
<div class="flex justify-evenly px-4 mb-6 shrink-0">
    <a href="tel:..." class="flex flex-col items-center gap-1 group">
        <div class="w-12 h-12 rounded-2xl bg-brand-surface flex items-center justify-center ...">
            <i data-lucide="phone" class="w-5 h-5"></i>
        </div>
        <span class="text-[10px] text-slate-500 font-medium">Call</span>
    </a>
    <!-- More icons... -->
</div>
```

> ⚠️ **DO NOT use `grid grid-cols-N`** — it creates fixed columns. When a card has 3 icons instead of 5, they bunch to the left. `flex justify-evenly` distributes any number of icons equally.

### Catalog Link

Only Hunter Lott's card has the Catalog link. All other cards had it removed. The block:

```html
<a href="/catalog.html" class="flex flex-col items-center gap-1 group">
    <div class="w-12 h-12 rounded-2xl bg-brand-surface flex items-center justify-center ...">
        <i data-lucide="folder-open" class="w-5 h-5"></i>
    </div>
    <span class="text-[10px] text-slate-500 font-medium">Catalog</span>
</a>
```

### Profile Photo Positioning

Each card's profile photos use `object-position` and `scale` to frame the person's face:

```html
<img class="w-full h-full object-cover object-[50%_-18%]"
     style="transform: scale(1.15)">
```

- `object-[X%_Y%]` controls the crop focus point
- Negative Y values (e.g., `-18%`) pull the image up (more headroom above hair)
- `scale(N)` zooms in/out on the face
- These values are tuned per person in the Change Order tool

**Both views** (compact circle + full view circle) must use the **same** positioning values.

---

## Photo Positioning Reference

| Person | object-position | scale | Notes |
|--------|----------------|-------|-------|
| Hunter Lott | 50% 0% | 1.00 | |
| Lindsey Lott | 50% 0% | 1.00 | External GitHub image |
| Kevin Harrington | 49% -18% | 1.15 | |
| Mike Calhoun | 46% -18% | 1.15 | |
| Rhonda Kalchik | 92% -10% | 1.03 | |
| Rhonda Swan | 40% -39% | 1.49 | |
| Jeff Hayzlett | 77% -17% | 1.18 | |
| Ty Crandall | 50% -24% | 1.29 | |
| Rich Goldstein | 49% -42% | 1.42 | |
| Carl Gould | 21% -34% | 1.31 | |
| Colten Page | 50% 20% | 1.00 | |
| Jessica Haley | 45% -14% | 1.17 | |
| Krista Cordier | 48% -30% | 1.35 | |

---

## PWA / Save to Homescreen

Each card has PWA support via:

1. **Manifest file** (`manifest-{name}.json`) — name, icons, start_url, theme_color
2. **apple-touch-icon** — `<link rel="apple-touch-icon">` in the HTML head
3. **Meta tags** — `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`

### Icon Requirements

Both the manifest icons and `apple-touch-icon` MUST point to the person's **profile photo**, not the generic favicon:

```html
<!-- CORRECT -->
<link rel="apple-touch-icon" href="../assets/images/contacts/jessica-haley.png">

<!-- WRONG — shows generic letter on homescreen -->
<link rel="apple-touch-icon" href="../favicon.png">
```

```json
{
  "icons": [
    { "src": "/assets/images/contacts/jessica-haley.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/images/contacts/jessica-haley.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Special cases:**
- Hunter uses `/assets/images/hunter-lott.png` (not in contacts subfolder)
- Lindsey uses external GitHub URL (no local file)

---

## Physics Effects

The compact view has interactive physics effects (dollar bills and gold coins) triggered by scroll/pull gestures:

```html
<div id="physics-layer" class="absolute inset-0 pointer-events-none overflow-hidden z-0"></div>
```

- `spawnDollar(offset)` — creates falling green dollar bill
- `spawnCoin(offset)` — creates bouncing gold coin
- Physics elements clear after 800ms on touch end
- `pointer-events: none` ensures physics don't block card interaction

### Physics CSS

```css
.dollar-bill {
    position: absolute;
    background-color: #85bb65; border: 1px solid #6da04e;
    width: 50px; height: 24px; border-radius: 2px;
    pointer-events: none; z-index: 0;
}
.gold-coin {
    position: absolute;
    background-color: #d4af37; border: 2px solid #b8972e;
    border-radius: 50%; pointer-events: none; z-index: 0;
}
```

---

## Per-Card Customization (Tailwind Config)

Each card has a custom Tailwind config for brand colors:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#1e3a5f',  // Navy variant
                    accent: '#e8a317',   // Gold variant
                    canvas: '#ebe9e5',   // Background
                    surface: '#e1dfdb',  // Neumorphic surface
                    pop: '#98A6D4',      // Secondary accent
                },
            },
            // Neumorphic shadows
            boxShadow: {
                'neu-flat': '6px 6px 12px #c8c5c0, -6px -6px 12px #ffffff',
                'neu-pressed': 'inset 3px 3px 6px #c8c5c0, inset -3px -3px 6px #ffffff',
            },
        },
    },
};
```

Colors vary per card — see the `colors` field in change-order.html card data.

---

## VCF (vCard) Files

Each card has a corresponding `.vcf` file at `/public/vcf/{name}.vcf` for the "Save Contact" feature. The vCard includes:
- Name, title, company
- Phone, email
- Photo (base64 encoded at runtime from the profile image)

The card's `downloadVCard()` function fetches the photo, converts to base64, and generates the VCF on the fly.

---

## Change Order Tool

The admin Change Order tool (`/admin/change-order.html`) allows adjusting card data without editing HTML:

### Card Data Fields
```javascript
{
    id, name, title, company, companyTagline,
    phone, email, website, calendarUrl, location,
    socials: [{ platform, url }],
    img, logo, logoInitials,
    posX, posY, zoom,           // Profile photo positioning
    logoPosX, logoPosY, logoZoom, // Logo positioning (Hunter only currently)
    colors: { primary, accent, canvas, surface },
    bio, mission, highlightsTitle, highlights: [{ label, text }],
}
```

### Photo Positioning Sliders
- X: -50 to 150 (maps to `object-position` X%)
- Y: -50 to 150 (maps to `object-position` Y%)
- Zoom: 50 to 250 (maps to `transform: scale(N/100)`)

### Change Order Output Format
```
📋 Person Name (cards/{slug}.html)
────────────────────────────────
  [Photo]
    object-position: X% Y%
    scale: N.NN
  [Logo]
    object-position: X% Y%
    scale: N.NN
  name: "Old" → "New"
  ...
```

---

## Common Pitfalls & Lessons Learned

### ❌ Don't use `whitespace-nowrap` on contact buttons
Use `truncate` instead — it includes overflow-hidden so long emails/phone numbers don't break the layout.

### ❌ Don't use `grid grid-cols-N` for action icons
Use `flex justify-evenly` so icons space evenly regardless of count.

### ❌ Don't use `w-48 h-48` for compact view photo circle
The right column only has ~177px of content width. Use `w-36 h-36` (144px).

### ❌ Don't use `object-contain` for circular logos
If the logo image is a circle on a square canvas, `object-contain` shows white corners. Use `object-cover` with `rounded-full` to clip.

### ❌ Don't point PWA icons to favicon.png
Each card's manifest and apple-touch-icon must point to the person's profile photo, or the homescreen icon shows a generic letter.

### ❌ Don't forget `orientationchange` listener
iOS doesn't fire `resize` reliably on orientation change. Always include the `orientationchange` listener with 100ms delay.

### ❌ Don't use `grid-cols-5` or fixed column counts
Cards have different numbers of action icons (3–6). Fixed column counts cause icons to bunch up.

### ✅ Always update BOTH views when changing photo positioning
The compact view circle and the full view circle must use identical `object-position` and `scale` values.

### ✅ Always update change-order.html when modifying card data
The card data array in change-order.html is the admin's source of truth for generating change orders.

---

## File Checklist: Adding a New Card

1. [ ] Create `/public/cards/{slug}.html` (copy from existing card, update all data)
2. [ ] Create `/public/cards/manifest-{slug}.json` (PWA manifest with profile photo icons)
3. [ ] Create `/public/vcf/{slug}.vcf` (vCard file)
4. [ ] Add contact photo to `/public/assets/images/contacts/{slug}.png`
5. [ ] Add entry to `/public/catalog.html` resources array
6. [ ] Add entry to `/public/catalog.html` contacts array
7. [ ] Add entry to `/public/admin/change-order.html` cards array
8. [ ] Set `apple-touch-icon` to profile photo path
9. [ ] Set manifest icons to profile photo path
10. [ ] Verify photo positioning in both compact and full views
11. [ ] Test contact grid overflow with long email addresses
12. [ ] Test on mobile (portrait + landscape rotation)

---

## Deploy

```bash
cd ~/Desktop/simpli-fi-id
firebase deploy --only hosting
# Hosting URL: https://simpli-fi-id.web.app
```

Local dev:
```bash
firebase serve --only hosting --port 5050  # Port 5000 is used by macOS ControlCenter
```

> **Firebase CLI auth expires periodically.** Run `firebase login --reauth` if deploy fails with auth errors.
> **firebase.json** must have `"site": "simpli-fi-id"` in the hosting config or deploy fails with "no site name" error.
