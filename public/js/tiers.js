// Simpli-FI ID — Shared Tier Definitions
// Usage: <script src="/js/tiers.js"></script>
// Provides: PRODUCT_TIERS, TIER_NORMALIZE, normalizeTier()

const PRODUCT_TIERS = {
  ambassador:   { name: 'Ambassador',   price: 0,    recurring: null, label: 'Free' },
  professional: { name: 'Professional', price: 1900, recurring: null, label: '$19 one-time' },
  founder:      { name: 'Founder',      price: 4900, recurring: 500,  label: '$49 + $5/mo' },
  enterprise:   { name: 'Enterprise',   price: null, recurring: null, label: 'Custom' },
};

const TIER_NORMALIZE = {
  'ambassador': 'ambassador',
  'professional': 'professional',
  'founder': 'founder',
  'enterprise': 'enterprise',
  // Legacy mappings
  'free': 'ambassador',
  'explorer': 'ambassador',
  'adventurer': 'professional',
  'pro': 'professional',
  'mentor': 'founder',
};

function normalizeTier(raw) {
  return TIER_NORMALIZE[(raw || '').toLowerCase()] || 'ambassador';
}
