# Simpli-FI ID: Development Standards

> Coding conventions and patterns for all contributors (human and AI).

---

## Language Standards

- **JavaScript**: ES6+ (arrow functions, template literals, async/await, destructuring)
- **No framework**: Vanilla JS. No React/Vue until explicitly decided.
- **No build step**: Code runs directly in browser via CDN + `<script>` tags.

### Variables & Naming

| Context | Convention | Example |
|---------|-----------|---------|
| JS variables | camelCase | `userData`, `scanCount` |
| JS functions | camelCase | `loadUserData()`, `handleSubmit()` |
| JS constants | UPPER_SNAKE | `MAX_LINKS`, `PRODUCT_TIERS` |
| CSS classes | kebab-case | `.tier-badge`, `.velvet-rope` |
| CSS variables | --kebab-case | `--color-primary` |
| Firestore fields | snake_case | `full_name`, `created_at` |
| HTML IDs | kebab-case | `#user-name`, `#submit-btn` |
| File names | kebab-case | `firebase-config.js` |

Always use `const`. Use `let` only when reassignment is needed. Never use `var`.

---

## Firebase Patterns

### Every Page Includes

```html
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-storage-compat.js"></script>
<script src="/js/firebase-config.js"></script>
<script src="/js/tiers.js"></script>
```

### Read Pattern

```javascript
async function loadUser(slug) {
  try {
    const doc = await db.collection('users').doc(slug).get();
    if (!doc.exists) { showError('Profile not found'); return null; }
    const data = doc.data();
    data.tier = normalizeTier(data.tier); // Always normalize legacy tier values
    return { id: doc.id, ...data };
  } catch (error) {
    console.error('Failed to load user:', error);
    showError('Unable to load profile. Please try again.');
    return null;
  }
}
```

### Write Pattern

```javascript
async function saveUser(slug, data) {
  try {
    await db.collection('users').doc(slug).set({
      ...data,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to save:', error);
    showError('Unable to save. Please try again.');
    return false;
  }
}
```

### Create Pattern

```javascript
async function createUser(slug, data) {
  try {
    await db.collection('users').doc(slug).set({
      ...data,
      slug, doc_id: slug, // doc_id is legacy compat
      tier: data.tier || 'ambassador',
      is_active: true,
      scan_count: 0,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to create user:', error);
    return false;
  }
}
```

### Event Logging (Fire-and-Forget)

```javascript
function logEvent(type, cardId, extra = {}) {
  if (!db) return;
  db.collection('events').add({
    type, card_id: cardId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    visitor_data: { user_agent: navigator.userAgent, referrer: document.referrer || null, ...extra },
  }).catch(e => console.warn('Event log failed:', e.message));
  // No await — don't block UI for analytics
}
```

### Tier Checking Pattern

```javascript
// Always use the shared PRODUCT_TIERS and normalizeTier() from tiers.js
const tier = normalizeTier(userData.tier);
const config = PRODUCT_TIERS[tier];

// Feature gating
const canShowTagline = (tier === 'founder' || tier === 'enterprise');
const isAdFree = (tier !== 'ambassador');
const canSaveContact = (tier !== 'ambassador');
```

---

## Error Handling

```javascript
// User-facing: friendly message
catch (error) {
  console.error('Firestore write failed:', error);
  showError('Something went wrong. Please try again.');
}

// WRONG: exposing technical info
showError(`Firebase error: ${error.code}`); // NO

// Helper functions
function showError(msg) {
  const el = document.getElementById('error-message');
  if (el) { el.textContent = msg; el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000); }
}
function showSuccess(msg) {
  const el = document.getElementById('success-message');
  if (el) { el.textContent = msg; el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000); }
}
```

---

## HTML Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title | Simpli-FI ID</title>
    <link rel="icon" href="/assets/images/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/shared.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@0.294.0/dist/umd/lucide.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.6.1/firebase-storage-compat.js"></script>
    <script src="/js/firebase-config.js"></script>
    <script src="/js/tiers.js"></script>
</head>
<body class="bg-[#FBF9F7] font-sans">
    <!-- Content -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            init();
        });
        async function init() { /* page logic */ }
    </script>
</body>
</html>
```

---

## Security Checklist

- [ ] No `innerHTML` with user-supplied data (use `textContent` or sanitize)
- [ ] Firestore rules enforce access control
- [ ] All Firestore writes wrapped in try/catch
- [ ] No sensitive data in URL params
- [ ] File:// protocol detection shows helpful error

---

## DOM Safety

```javascript
// CORRECT — textContent for user-supplied data
nameEl.textContent = userData.full_name;

// ONLY use innerHTML with trusted/generated data
badgeEl.innerHTML = `<span class="tier-badge ${tier}">${PRODUCT_TIERS[tier].name}</span>`;

// WRONG — innerHTML with user content (XSS)
el.innerHTML = userData.bio; // NO
```

---

## Git Conventions

**Branches**: `feature/xyz`, `fix/xyz`, `chore/xyz`
**Commits**: Conventional format — `feat(card): add QR sharing modal`
**Scopes**: card, intake, dashboard, admin, ops, airlock, auth, tiers, schema

**Never commit**: `.env`, service account keys, `node_modules/`, `.firebase/`

---

## Code Comments

```javascript
/** @param {string} slug - User's URL slug */
/** @returns {Promise<Object|null>} User data or null */

// TODO(hunter): Add LemonSqueezy webhook
// FIXME: QR modal doesn't close on mobile Safari
```

Only comment non-obvious logic. Don't comment the obvious.

---

## Testing (MVP Level)

### Manual Checklist Per Feature

- [ ] Chrome desktop + Safari mobile + Chrome mobile
- [ ] Slow 3G (DevTools throttle)
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Tier-gated features show/hide correctly for each of the 4 tiers
- [ ] No console errors

### When to Add Automated Tests

When building: achievement engine, Airlock service, payment webhooks, anything touching money.

---

## Dependency Policy

| Library | Version | Purpose |
|---------|---------|---------|
| Firebase SDK (compat) | 11.6.1 | DB, auth, storage |
| Tailwind CSS | CDN latest | Utility CSS |
| Lucide Icons | 0.294.0 | Icons |
| Inter Font | Latest | Typography |
| qrcode-generator | Self-contained | QR codes |

Before adding any dependency: Can vanilla JS do this in <50 lines? If yes, don't add it.
