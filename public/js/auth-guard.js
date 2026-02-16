// Simpli-FI ID — Auth Guard
// Usage: <script src="/js/auth-guard.js"></script>
// Redirects to login page if user is not authenticated (or is anonymous)
(function() {
  auth.onAuthStateChanged(function(user) {
    if (!user || user.isAnonymous) {
      window.location.href = '/account/login.html';
    }
  });
})();
