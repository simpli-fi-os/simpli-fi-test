# Simpli-FI ID: Firestore Schema

> Complete field-level documentation for all Firestore collections.
> This is the source of truth. Code must conform to this schema.

---

## Collection: `users/{slug}`

**Purpose:** User profiles. Created by the intake form. The document ID IS the slug.

**Access:** Owner can read/write. Public can read if `is_active == true`.

### Fields

| Field | Type | Required | Default | Validation | Notes |
|-------|------|----------|---------|------------|-------|
| `full_name` | string | ✅ | — | 2-100 chars | Display name on card |
| `first_name` | string | ✅ | — | 1-50 chars | Extracted from full_name |
| `last_name` | string | ✅ | — | 1-50 chars | Extracted from full_name |
| `title` | string | ❌ | `""` | 0-100 chars | Job title |
| `company` | string | ❌ | `""` | 0-100 chars | Company/org name |
| `tagline` | string | ❌ | `""` | 0-200 chars | Company tagline (Founder+ only) |
| `bio` | string | ❌ | `""` | 0-500 chars | About section |
| `mission` | string | ❌ | `""` | 0-300 chars | Personal mission statement |
| `email` | string | ❌ | `""` | Valid email or empty | Contact email |
| `phone` | string | ❌ | `""` | E.164 or formatted US phone | Contact phone |
| `location` | string | ❌ | `""` | 0-100 chars | City, State format |
| `social_links` | map | ❌ | `{}` | See sub-fields | Social media links |
| `social_links.website` | string | ❌ | `""` | Valid URL or empty | Personal/company website |
| `social_links.primary` | map | ❌ | `null` | `{ platform, url }` | Primary social link |
| `social_links.primary.platform` | string | ❌ | — | linkedin, twitter, instagram, github, youtube, tiktok | Platform ID |
| `social_links.primary.url` | string | ❌ | — | Valid URL | Full profile URL |
| `payment_link` | string | ❌ | `""` | Valid URL or empty | Payment/commerce link (Founder+ only) |
| `custom_color` | string | ❌ | `"#1e293b"` | Valid hex color | Card accent color (Professional+) |
| `tier` | string | ✅ | `"ambassador"` | `ambassador`, `professional`, `founder`, `enterprise` | Product tier |
| `slug` | string | ✅ | — | URL-safe, 3-50 chars, lowercase | Unique URL ID = doc ID |
| `doc_id` | string | ✅ | — | Same as slug | Legacy compat field |
| `avatar_url` | string | ❌ | `""` | Firebase Storage URL | Profile photo |
| `logo_url` | string | ❌ | `""` | Firebase Storage URL | Company logo (Founder+) |
| `is_active` | boolean | ✅ | `true` | — | Public visibility |
| `scan_count` | number | ❌ | `0` | Integer >= 0 | Incremented by event logging |
| `guild_id` | string | ❌ | `null` | Valid guild doc ID | Enterprise org membership |
| `tier_purchased_at` | timestamp | ❌ | `null` | — | When tier was purchased |
| `lemon_customer_id` | string | ❌ | `null` | — | LemonSqueezy customer ref |
| `created_at` | timestamp | ✅ | `serverTimestamp()` | — | Account creation |
| `updated_at` | timestamp | ✅ | `serverTimestamp()` | — | Last update |
| `last_active` | timestamp | ❌ | `null` | — | Last scan or login |

### Gamification Fields (Phase 3+ — NOT YET IN USE)

These fields are reserved for the future community/leveling system. Do not build against these for MVP.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `xp` | number | `0` | Experience points — Phase 3+ |
| `level` | number | `1` | Gamification level 1-8 — Phase 3+ |
| `achievements` | array | `[]` | Earned achievement IDs — Phase 3+ |
| `community_active` | boolean | `false` | SKOOL subscription — Phase 3+ |

### Indexes

| Fields | Purpose |
|--------|---------|
| `tier`, `created_at` | Filter users by tier |
| `guild_id`, `scan_count` | Leaderboard within an enterprise |
| `is_active` | Filter active profiles |
| `scan_count` (desc) | Global leaderboard |

### Common Access Patterns

```javascript
// Get user by slug (card display — most common)
db.collection('users').doc(slug).get()

// Get all active users in an enterprise guild
db.collection('users').where('guild_id', '==', guildId).where('is_active', '==', true).get()

// Leaderboard (top 10 by scans)
db.collection('users').where('is_active', '==', true).orderBy('scan_count', 'desc').limit(10).get()
```

### Legacy Tier Values in Existing Data

Old documents may have legacy tier values. Always normalize:

| Legacy Value | Normalizes To |
|-------------|--------------|
| `free` | `ambassador` |
| `explorer` | `ambassador` |
| `adventurer` | `professional` |
| `pro` | `professional` |
| `mentor` | `founder` |

---

## Collection: `events/{auto-id}`

**Purpose:** Analytics events — scans, clicks, interactions. Auto-generated document IDs.

**Access:** Anonymous write (for scan tracking). Owner read (via card_id match).

### Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `type` | string | ✅ | `scan`, `click_email`, `click_phone`, `click_website`, `click_social`, `click_viral_offer`, `click_mothership`, `save_contact`, `view_qr` | Event type |
| `card_id` | string | ✅ | Valid user slug | Which card triggered the event |
| `card_owner` | string | ❌ | — | Display name (denormalized) |
| `timestamp` | timestamp | ✅ | `serverTimestamp()` | When it occurred |
| `visitor_data` | map | ❌ | — | Anonymous visitor metadata |
| `visitor_data.user_agent` | string | ❌ | — | Browser user agent |
| `visitor_data.referrer` | string | ❌ | — | HTTP referrer |
| `visitor_data.ip` | string | ❌ | — | Visitor IP (Airlock only; PII/GDPR) |

---

## Collection: `guilds/{guildId}`

**Purpose:** Organization data for Enterprise tier.

### Fields

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | string | ✅ | — | Organization name |
| `owner_id` | string | ✅ | — | Admin user slug |
| `tier` | string | ✅ | `"enterprise"` | Always `enterprise` for guilds |
| `member_count` | number | ❌ | `0` | Active members |
| `member_slugs` | array | ❌ | `[]` | Member user slug references |
| `settings.branding_color` | string | ❌ | `"#1e293b"` | Guild brand color |
| `settings.logo_url` | string | ❌ | `""` | Guild logo |
| `created_at` | timestamp | ✅ | — | Guild creation |

---

## Collection: `public_cards/{shortId}` (Airlock Use Only)

**Purpose:** Lookup table for the Airlock redirect service. Maps short IDs → destination URLs.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `destination_url` | string | ✅ | Redirect target URL |
| `owner_id` | string | ✅ | User slug |
| `is_active` | boolean | ✅ | Disable without deleting |
| `created_at` | timestamp | ✅ | — |

---

## Collection: `achievements/{id}` (Phase 3+ — NOT YET IN USE)

**Purpose:** Achievement definitions catalog for gamification system. Reserved for future use.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | "First Handshake" |
| `description` | string | "Received your first scan" |
| `category` | string | `connection`, `growth`, `impact` |
| `xp_reward` | number | XP awarded on unlock |
| `trigger_type` | string | `scan_count`, `connection_count`, `manual` |
| `trigger_threshold` | number | Events needed to trigger |

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{slug} {
      allow read: if resource.data.is_active == true
                  || (request.auth != null && request.auth.uid == slug);
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == slug;
      allow delete: if false;
    }
    match /events/{eventId} {
      allow create: if true;
      allow read: if request.auth != null;
      allow update, delete: if false;
    }
    match /guilds/{guildId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == resource.data.owner_id;
    }
    match /public_cards/{shortId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```
