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

// Anonymous auth (for write operations)
auth.signInAnonymously().catch(e => console.warn('Anonymous auth failed:', e.message));

console.log('[Simpli-FI] Firebase initialized — project: simpli-fi-id');
