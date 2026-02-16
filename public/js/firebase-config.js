// Simpli-FI ID — Shared Firebase Configuration
// Usage: <script src="/js/firebase-config.js"></script>
// Provides: window.db, window.auth, window.storage
// SDK: 11.6.1 compat mode (loaded via CDN in HTML)

const firebaseConfig = {
  apiKey: "AIzaSyAnlmGZNwoPS-vBnK1AlHvNsB73q0UAkCU",
  authDomain: "simpli-fi-id.firebaseapp.com",
  projectId: "simpli-fi-id",
  storageBucket: "simpli-fi-id.firebasestorage.app",
  messagingSenderId: "97006103916",
  appId: "1:97006103916:web:631c876a6eb263caf81749"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

window.db = db;
window.auth = auth;
window.storage = storage;

// Conditional anonymous auth — only sign in anonymously if no user is signed in
// Pages that handle their own auth (login, portal) set this flag to suppress
window._suppressAnonymousAuth = window._suppressAnonymousAuth || false;
auth.onAuthStateChanged(user => {
  if (!user && !window._suppressAnonymousAuth) {
    auth.signInAnonymously().catch(e => console.warn('Anonymous auth failed:', e.message));
  }
});

// Wait for auth to resolve (useful for pages that need a user before proceeding)
function waitForAuth(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Auth timeout')), timeout);
    const unsubscribe = auth.onAuthStateChanged(user => {
      clearTimeout(timer);
      unsubscribe();
      resolve(user);
    });
  });
}

// Look up a user's Firestore doc by their Firebase Auth UID
// Returns { slug, ...userData } or null if no linked account found
async function getUserByAuthUid(uid) {
  const snapshot = await db.collection('users').where('auth_uid', '==', uid).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { slug: doc.id, ...doc.data() };
}

window.waitForAuth = waitForAuth;
window.getUserByAuthUid = getUserByAuthUid;

console.log('[Simpli-FI] Firebase initialized — project: simpli-fi-id');
