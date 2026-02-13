# Tier Consistency Audit Report

> Generated: 2026-02-11
> Purpose: Identify every file with incorrect or conflicting tier information.

---

## The Standard (Source of Truth)

**Product Tiers** (billing — what users pay for):

| Tier | Price | Firestore Value |
|------|-------|-----------------|
| Ambassador | Free | `ambassador` |
| Professional | $19 one-time | `professional` |
| Founder | $49 + $5/mo | `founder` |
| Enterprise | Custom | `enterprise` |

**Gamification Levels** (XP progression — future Phase 3+ feature, NOT product tiers):

| Level | Name | XP |
|-------|------|----|
| 1 | Explorer | 0 |
| 2 | Seeker | 100 |
| 3 | Connector | 300 |
| 4 | Professional | 600 |
| 5 | Rising Star | 1,000 |
| 6 | Expert | 1,800 |
| 7 | Mentor | 3,000 |
| 8 | Legend | 5,000 |

---

## Files Using CORRECT Tier Names ✅

These files already use Ambassador/Professional/Founder/Enterprise:

| File | Status | Notes |
|------|--------|-------|
| **index.html** | ✅ Correct | Landing page shows correct 4 tiers with correct pricing |
| **intake_form.html** | ✅ Correct | Uses Ambassador, Professional, Founder/Ent buttons |
| **master-console.html** | ✅ Correct | Feature matrix uses Ambassador ($Free), Professional ($19), Founder ($49+$5/mo), Enterprise (Custom) |
| **ops_center.html** | ✅ Correct | Tier chart labels: AMBASSADOR, PRO, FOUNDER; feed shows ENTERPRISE |
| **resource_catalog.html** | ✅ Correct | References "Free Ambassador Card" |

---

## Files Using WRONG Tier Names ❌

These files use gamification level names (Explorer, Adventurer, Mentor) as product tier names:

### ❌ CHANGELOG.md

**Problem**: Documents a tier rename that never happened on the live site.

| Line | Issue |
|------|-------|
| L27 | `"Now available for Adventurer+ tiers"` — should be Professional+ or Founder+ |
| L30 | `"Changed from free/pro/founder to explorer/adventurer/professional/mentor"` — This rename was planned but the live site uses Ambassador/Professional/Founder/Enterprise |
| L68 | `tier: "adventurer"` — should be `professional` |
| L89 | `"Now shows for Adventurer+ tiers"` — should be Founder+ |
| L108-115 | `TIER_CONFIG` uses explorer/adventurer/professional/mentor — wrong names |
| L129 | `"Tier names changed from free/pro/founder to explorer/adventurer/professional/mentor"` — incorrect |

**Fix**: Rewrite TIER_CONFIG section to use ambassador/professional/founder/enterprise. Update all feature references to match the actual feature matrix.

---

### ❌ tiers-and-pricing.md

**Problem**: Entire document uses wrong tier names AND wrong pricing.

| Section | Current (Wrong) | Should Be |
|---------|----------------|-----------|
| Consumer tiers | Explorer (Free), Adventurer ($49), Professional ($99), Mentor ($149) | Ambassador (Free), Professional ($19), Founder ($49+$5/mo), Enterprise (Custom) |
| Pricing | $49/$99/$149 one-time + $29/mo community | $19 one-time / $49+$5/mo / Custom |
| Community | $29/mo SKOOL subscription | $5/mo included with Founder |
| Organization tiers | Guild ($39/user), Academy (custom) | Enterprise (Custom) |
| Stripe config | Adventurer 4900, Professional 9900, Mentor 14900 | Professional 1900, Founder 4900 |

**Fix**: Complete rewrite needed. This document is the most out-of-date. Replace entirely with current pricing from index.html.

---

### ❌ intake_form_v2.html

**Problem**: Uses explorer/adventurer/professional/mentor as tier selection options.

| Line | Issue |
|------|-------|
| L158 | Tier card labeled "Explorer" — should be Ambassador |
| L168-172 | Tier card labeled "Adventurer" at $49 — wrong name and price |
| L185-189 | Tier card labeled "Professional" at $99 — wrong price ($19) |
| L201-205 | Tier card labeled "Mentor" at $149 — should be Founder at $49 |
| L247 | "Continue with free Explorer tier" — should be Ambassador |
| L269 | Default tier label "Explorer" — should be Ambassador |

**Fix**: Update all tier references. Note: intake_form.html (v1) is correct. Consider whether v2 or v1 should be canonical — v1 matches the live site.

---

### ❌ SKILL.md (Journey Architect)

**Problem**: References explorer/adventurer/professional/mentor as product tiers.

| Line | Issue |
|------|-------|
| L40 | `tier: 'explorer' | 'adventurer' | 'professional' | 'mentor'` — wrong enum |
| L296-312 | Stripe products: Adventurer $49, Professional $99, Mentor $149 — wrong names/prices |

**Fix**: Update tier enum to `ambassador | professional | founder | enterprise`. Update Stripe products to match current pricing.

---

### ❌ mvp-checklist.md

**Problem**: References wrong tier names in Stripe section.

| Line | Issue |
|------|-------|
| L62 | "Products created (Adventurer, Professional, Mentor)" — should be Professional, Founder |
| L69 | "Free tier limits enforced (3 links)" — should reference "Ambassador" not "Free tier" |

**Fix**: Update product names and tier references.

---

### ❌ technical-architecture.md

**Problem**: References tier as generic enum without specifying valid values.

| Line | Issue |
|------|-------|
| L150 | `tier: enum` — should specify `ambassador | professional | founder | enterprise` |
| L189 | `tier: enum` in guilds — should specify `enterprise` |

**Fix**: Add valid enum values.

---

### ❌ advisory-board.md

**Problem**: Multiple references to wrong tier names and old pricing model.

| Line | Issue |
|------|-------|
| L9 | "Tiers must convert" — generic, OK |
| L55 | "free tier needs to spread" — should say "Ambassador tier" |
| L86 | "free tier spread through an organization" — should say "Ambassador" |
| L134 | "Community (cohorts, mentor matching, events) = $/mo SKOOL subscription" — doesn't match current model ($5/mo included with Founder) |

**Fix**: Search/replace "free tier" → "Ambassador tier". Update community pricing model references.

---

### ❌ gamification-system.md

**Problem**: Uses level names that overlap with tier names, causing confusion.

| Section | Issue |
|---------|-------|
| Level names | "Explorer", "Professional", "Mentor" appear as both levels AND tiers in other docs |
| Level 4 | "Professional" level name same as "Professional" product tier — ambiguous |

**Fix**: This file is CORRECT for gamification levels — these are the right XP-based level names. The confusion arose because other documents incorrectly used these level names as product tier names. Add a header clarifying: "These are gamification LEVELS, not product TIERS. Product tiers are Ambassador, Professional, Founder, Enterprise."

---

### ❌ README.md

**Problem**: Uses old tier values.

| Line | Issue |
|------|-------|
| L27 | `"tier": "pro"` — should be `"professional"` |
| L28 | `// free, pro, founder` — should be `// ambassador, professional, founder, enterprise` |

**Fix**: Update enum comment and example value.

---

## Files With No Tier Issues ✅

| File | Notes |
|------|-------|
| `hunter.html` | Hardcoded card, no tier logic. Deprecated. |
| `lindsey.html` | Hardcoded card, no tier logic. Deprecated. |
| `project_structure.html` | Mostly code templates. Has generic `tier` ref but not specific wrong names. |

---

## Summary: Fix Priority

| Priority | File | Effort | Impact |
|----------|------|--------|--------|
| 🔴 HIGH | tiers-and-pricing.md | Complete rewrite | Core pricing document — most referenced |
| 🔴 HIGH | CHANGELOG.md (TIER_CONFIG section) | Edit ~20 lines | Referenced by card.html logic |
| 🔴 HIGH | SKILL.md | Edit ~10 lines | Used by Claude Code/Claude.ai |
| 🟡 MEDIUM | intake_form_v2.html | Edit ~15 lines | May be deprecated in favor of v1 |
| 🟡 MEDIUM | mvp-checklist.md | Edit ~5 lines | Task tracker |
| 🟡 MEDIUM | advisory-board.md | Search/replace | Strategic reference doc |
| 🟢 LOW | technical-architecture.md | Edit 2 lines | Add enum values |
| 🟢 LOW | README.md | Edit 2 lines | Quick fix |
| ✅ DONE | gamification-system.md | Add clarifying header | Content is correct, just needs disambiguation |

---

## Root Cause

The project went through a tier naming brainstorm where gamification level names (Explorer, Adventurer, Mentor) were considered as product tier names. Some documents were updated to reflect this brainstorm, but the **live site** kept the original names (Ambassador, Professional, Founder, Enterprise). This created a split where:

- **Live code** (index.html, intake_form.html, ops_center.html, master-console.html) → Correct names
- **Documentation** (tiers-and-pricing.md, CHANGELOG.md, SKILL.md) → Brainstorm names
- **intake_form_v2.html** → Brainstorm names (built against the wrong docs)

## Resolution

1. All new documents (CLAUDE.md, firestore-schema.md, design-system.md, development-standards.md) now use the correct tier names.
2. The files listed above need to be updated to match.
3. The `normalizeTier()` function in CLAUDE.md handles legacy Firestore data gracefully.
