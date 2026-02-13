// Simpli-FI ID — Shared Firebase Configuration
// Usage: <script src="/js/firebase-config.js"></script>
// Provides: window.db, window.auth, window.storage

const firebaseConfig = {
  apiKey: "AIzaSyAnlmGZNwoPS-vBnK1AlHvNsB73q0UAkCU",
  authDomain: "simpli-fi-id.firebaseapp.com",
  projectId: "simpli-fi-id",
  storageBucket: "simpli-fi-id.firebasestorage.app",
  messagingSenderId: "97006103916",
  appId: "1:97006103916:web:631c876a6eb263caf81749"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
window.auth = firebase.auth();
window.storage = firebase.storage();
