# Simpli-FI ID — Status Report (Feb 13, 2026)

---

## COMPLETED

**1. firebase-config.js** — Updated
- Replaced unconditional anonymous auth with conditional `onAuthStateChanged`
- Added `waitForAuth()` helper (waits for auth to resolve)
- Added `getUserByAuthUid()` helper (looks up Firestore user doc by Auth UID)

**2. tiers.js** — Updated
- Added `changeOrders` and `changeOrderLimit` to all 4 tiers
- Ambassador: 0 changes, Professional: 1/year, Founder/Enterprise: unlimited
- Added `canSubmitChangeOrder()` helper function

**3. firestore.rules** — Updated
- Users collection: public read, owner update via `auth_uid` field, signed-in create, no deletes
- New `change_orders` collection: immutable audit trail, owner read, signed-in create
- Events: kept append-only

**4. auth-guard.js** — Created
- Redirects to login if user is not authenticated or is anonymous

**5. Intake form (intake/index.html)** — Updated
- Added "Account Security" section with email, password, confirm password fields
- Added Google Sign-In button
- Updated `submitForm()` to create Firebase Auth account + write `auth_uid`, `account_email`, `change_order_count` to Firestore
- Added "Go to Portal" button on success modal
- User-friendly error messages for auth failures

**6. Login page (account/login.html)** — Created
- Email + password login
- Google Sign-In (using redirect flow)
- Forgot password (sends reset email)
- Auto-redirects to portal if already signed in
- "Claim your ID" link to intake

**7. User portal (account/index.html)** — Created
- Auth-guarded (redirects to login if not signed in)
- Shows card preview (avatar, name, title, tier badge)
- "View My Card" link
- Tier-aware change order status (Ambassador: upgrade CTA, Professional: 1-of-1 tracker, Founder: unlimited)
- Account info with change password option
- Quick links (View Card, Upgrade, Enterprise Dashboard)
- Sign out

**8. Change order form (account/change-order.html)** — Created
- Auth-guarded + tier limit check on load
- Pre-populated from Firestore data
- Live preview panel (mirrors intake form layout)
- Change detection with gold border on edited fields
- Writes change order audit record to `change_orders` collection
- Increments `change_order_count` on user doc

**9. Admin dashboard (admin/dashboard.html)** — Updated
- Added shared script imports (firebase-config.js, tiers.js, auth-guard.js)
- Added enterprise tier auth gate
- Added sign out handler

**10. Landing page (index.html)** — Updated
- Added "Log In" link in nav bar
- Updated all "Claim Your ID" buttons from old GitHub Pages URL to `/intake/`

**11. Firebase Console** — Manual steps done by Hunter
- Enabled Email/Password sign-in
- Enabled Google sign-in
- Deleted 9 test client accounts

**12. Firebase Hosting** — Deployed
- Site live at `https://simpli-fi-id.web.app`

---

## CURRENTLY TROUBLESHOOTING

**Google Sign-In — "Unable to verify that the app domain is authorized"**
- Google button on login page throws a 403 error
- Tried: popup flow, redirect flow, deploying hosting, updating `authDomain` to `.web.app`
- Latest fix applied: changed `authDomain` from `simpli-fi-id.firebaseapp.com` to `simpli-fi-id.web.app`
- Waiting for Hunter to refresh and test

---

## STILL NEEDS DOING

1. **Verify Google Sign-In works** — resolve the current auth domain issue
2. **Test email+password flow end-to-end** — intake form creates account, login works, portal loads
3. **Test change order flow** — submit a change, verify it saves, verify tier limits enforce
4. **Test auth guard** — navigate to `/account/` while logged out, confirm redirect to login
5. **Test forgot password** — send reset email, verify it arrives
6. **Migrate to Firebase Hosting** — when ready, point `id.simpli-fi-os.com` to Firebase Hosting and add it to authorized domains

---

## FILE INVENTORY

| File | Status |
|------|--------|
| `public/js/firebase-config.js` | Modified |
| `public/js/tiers.js` | Modified |
| `public/js/auth-guard.js` | **New** |
| `firestore.rules` | Modified |
| `public/intake/index.html` | Modified |
| `public/account/login.html` | **New** |
| `public/account/index.html` | **New** |
| `public/account/change-order.html` | **New** |
| `public/admin/dashboard.html` | Modified |
| `public/index.html` | Modified |
