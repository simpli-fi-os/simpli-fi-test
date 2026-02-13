# CLAUDE.md — Simpli-FI ID

> Instructions for Claude Code. Read this ENTIRE file before writing any code.

## Project Overview

Simpli-FI ID is a **Professional Journey RPG** that turns career growth into a visible, gamified experience. Users create digital identity cards with QR codes. Scanning logs connections and triggers achievements. Organizations invest in their people's growth through the platform.

**This is NOT a digital business card company.** It is infrastructure for making professional growth visible and rewarding. Every feature should pass the Mission Test: does it help someone level up, invest in another person's journey, tell an inspiring story, or make the business more sustainable?

**Founder**: Hunter Lott (Denton, TX). Day job at Denton Fire Department. Also runs Simpli-FI Alpha LLC (RIA).

**Current stage**: MVP. Ship fast, validate with paying customers. First paying customer > perfect product.

---

## CRITICAL: Product Tiers vs. Gamification Levels

These are TWO SEPARATE SYSTEMS. Never conflate them.

```
PRODUCT TIERS (billing — what you pay for):
┌──────────────────────────────────────────┐
│ Ambassador    │ Free                     │
│ Professional  │ $19 one-time             │
│ Founder       │ $49 + $5/mo              │
│ Enterprise    │ Custom                   │
└──────────────────────────────────────────┘

GAMIFICATION LEVELS (XP progression — future community feature, Phase 3+):
┌──────────────────────────────────────────┐
│ 1. Explorer     │  0 XP                  │
│ 2. Seeker       │  100 XP                │
│ 3. Connector    │  300 XP                │
│ 4. Professional │  600 XP                │
│ 5. Rising Star  │  1,000 XP              │
│ 6. Expert       │  1,800 XP              │
│ 7. Mentor       │  3,000 XP              │
│ 8. Legend       │  5,000 XP              │
└──────────────────────────────────────────┘
```

- A user's **tier** determines features they can access (billing relationship).
- A user's **level** tracks journey progress (community/gamification — NOT YET BUILT).
- These are independent. An Ambassador can be Level 5. A Founder can be Level 1.
- **For MVP**: Only tiers matter. Levels are a future Phase 3+ feature.

---

## ABSOLUTE RULES (Never Violate)

### 1. Product Tier Names Are Standardized

```javascript
// CORRECT — the 4 product tiers (always use these)
const PRODUCT_TIERS = {
  ambassador:    { name: 'Ambassador',    price: 0,    recurring: null, label: 'Free' },
  professional:  { name: 'Professional',  price: 1900, recurring: null, label: '$19 one-time' },
  founder:       { name: 'Founder',       price: 4900, recurring: 500,  label: '$49 + $5/mo' },
  enterprise:    { name: 'Enterprise',    price: null, recurring: null, label: 'Custom' },
};

// WRONG — these are gamification level names, NOT tier names
'explorer'    // NO — gamification level, not a product tier
'adventurer'  // NO — gamification level, not a product tier
'mentor'      // NO — gamification level, not a product tier
'seeker'      // NO — gamification level, not a product tier

// WRONG — informal abbreviations
'free'        // NO — use 'ambassador'
'pro'         // NO — use 'professional'
'basic'       // NO — use 'ambassador'
```

### 2. Firebase Configuration Comes From Shared Module

```javascript
// CORRECT — import shared config: <script src="/js/firebase-config.js"></script>
// Then use: window.db, window.auth, window.storage

// WRONG — never inline Firebase config in HTML files
const firebaseConfig = { apiKey: "AIza..." }; // NO
```

### 3. Firestore Field Names Use snake_case

```javascript
// CORRECT: { full_name, created_at, scan_count }
// WRONG:   { fullName, createdAt, scanCount }
```

### 4. Never Delete User Data Without Confirmation

Always soft-delete or archive. Admin tools may hard-delete with explicit confirmation.

### 5. All Monetary Values in Code Use Cents (Integers)

```javascript
// CORRECT: const price = 1900;  // $19.00
// WRONG:   const price = 19.00; // floating point
```

### 6. No Achievement Rewards for Vanity Metrics

Only reward REAL growth (mentor sessions, promotions, connections) — never login streaks, share counts, or spam activity.

---

## Product Tier Feature Matrix (Source of Truth)

| Feature | Ambassador (Free) | Professional ($19) | Founder ($49+$5/mo) | Enterprise (Custom) |
|---------|:-:|:-:|:-:|:-:|
| Digital Card + QR | ✅ | ✅ | ✅ | ✅ |
| Basic Profile + 3 Links | ✅ | ✅ | ✅ | ✅ |
| Ad-Free | ❌ | ✅ | ✅ | ✅ |
| Save Contact (vCard) | ❌ | ✅ | ✅ | ✅ |
| Custom Colors | ❌ | ✅ | ✅ | ✅ |
| Unlimited Links | ❌ | ❌ | ✅ | ✅ |
| Company Tagline | ❌ | ❌ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| Gold Badge | ❌ | ❌ | ✅ | ✅ |
| Commerce/Payment Link | ❌ | ❌ | ✅ | ✅ |
| Resource Catalog | ❌ | ❌ | ✅ | ✅ |
| Analytics Dashboard | ❌ | ❌ | Personal | Full Team |
| Unlimited Updates | ❌ | 1/year | ✅ | ✅ |
| Bulk Provisioning | ❌ | ❌ | ❌ | ✅ |
| Brand Lock | ❌ | ❌ | ❌ | ✅ |
| "Powered by Simpli-FI" | Shown | Hidden | Hidden | Hidden |

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Hosting | Firebase Hosting | — | Serves `/public` directory |
| Database | Cloud Firestore | — | Primary data store |
| Auth | Firebase Auth | — | Anonymous auth for MVP |
| Storage | Firebase Storage | — | Avatars, logos |
| Payments | LemonSqueezy | — | Pre-Stripe; no entity needed |
| Frontend | Vanilla JS (ES6+) | — | No framework, no build step |
| CSS | Tailwind CDN | — | + shared.css for brand tokens |
| Firebase SDK | Compat mode | 11.6.1 | **Always 11.6.1** — never 9.22.0 |
| Icons | Lucide | 0.294.0 | CDN: unpkg.com/lucide |

---

## Project Structure

```
simpli-fi-id/
├── CLAUDE.md
├── firebase.json
├── firestore.rules
├── .firebaserc
├── .gitignore
├── public/                          # Firebase Hosting root (deployable)
│   ├── index.html                   # Landing page with pricing
│   ├── card.html                    # Dynamic card display (?u=slug)
│   ├── favicon.png
│   ├── catalog.html                 # Resource catalog
│   ├── cards/
│   │   ├── hunter.html              # Hunter's showcase card
│   │   └── lindsey.html             # Lindsey's showcase card
│   ├── intake/
│   │   ├── index.html               # Profile creation (canonical)
│   │   └── v2.html                  # V2 intake (needs tier fixes)
│   ├── admin/
│   │   ├── console.html             # Master admin console
│   │   ├── ops.html                 # Operations center
│   │   ├── dashboard.html           # Enterprise dashboard
│   │   └── enterprise-setup.html    # Enterprise onboarding
│   ├── dfd/
│   │   └── catalog.html             # DFD resource catalog
│   ├── js/
│   │   ├── firebase-config.js       # Single Firebase init
│   │   └── tiers.js                 # Tier definitions + normalizeTier()
│   ├── css/
│   │   └── shared.css               # Brand design tokens
│   └── assets/images/
│       ├── hunter-lott.png
│       └── social-preview.png
├── airlock/                         # Cloud Run redirect service
│   ├── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── functions/                       # Cloud Functions (Phase 3+)
│   ├── index.js
│   └── package.json
└── docs/                            # Documentation
    ├── README.md
    ├── design-system.md
    ├── development-standards.md
    ├── firestore-schema.md
    ├── tier-consistency-audit.md
    └── command-center-reference.jpg
```

### Showcase Cards vs Dynamic Cards

| File | Purpose |
|------|---------|
| `public/cards/hunter.html` | Static showcase card (hardcoded data) |
| `public/cards/lindsey.html` | Static showcase card (hardcoded data) |
| `public/card.html?u=slug` | Dynamic card (loads from Firestore) |

---

## Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#1e293b` | Headers, primary buttons, text |
| Gold | `#fbbf24` | CTAs, achievements, highlights |
| Periwinkle | `#98A6D4` | Secondary accents |
| Warm White | `#FBF9F7` | Page backgrounds |
| Teal | `#0d9488` | Founder tier card |
| Coral | `#f87171` | Ambassador tier accent |

### Tier Badge Styling

| Tier | BG | Text |
|------|-----|------|
| Ambassador | coral/10 | coral |
| Professional | navy | white |
| Founder | teal | white |
| Enterprise | purple | white |

---

## Firestore Quick Reference

| Collection | Key Fields |
|-----------|-----------|
| `users/{slug}` | full_name, tier*, email, slug, scan_count |
| `events/{auto}` | type, card_id, timestamp, visitor_data |
| `guilds/{guildId}` | name, owner_id, tier*, member_count |
| `public_cards/{shortId}` | destination_url, owner_id |

*tier field: one of `ambassador`, `professional`, `founder`, `enterprise`

### Legacy Tier Normalization

```javascript
const TIER_NORMALIZE = {
  'ambassador': 'ambassador', 'professional': 'professional',
  'founder': 'founder', 'enterprise': 'enterprise',
  // Legacy mappings
  'free': 'ambassador', 'explorer': 'ambassador',
  'adventurer': 'professional', 'pro': 'professional',
  'mentor': 'founder',
};
function normalizeTier(raw) {
  return TIER_NORMALIZE[(raw || '').toLowerCase()] || 'ambassador';
}
```

---

## Firebase SDK

**Project ID**: `simpli-fi-id` | **SDK**: Always 11.6.1 compat

```html
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-storage-compat.js"></script>
<script src="/js/firebase-config.js"></script>
```

---

## Git & Dev

```bash
# Local dev
firebase serve --only hosting --port 5000

# Deploy
firebase deploy --only hosting

# Branch naming: feature/xyz, fix/xyz
# Commits: feat(scope): desc, fix(scope): desc
```

Never open HTML with `file://` — use a local server.

---

## MVP Priority

1. Profile → QR → Scan → Log → Payment
2. Close first 3 paying customers
3. DFD Enterprise pilot
4. Community/gamification levels (Phase 3+)
