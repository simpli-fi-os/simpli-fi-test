// Simpli-FI ID — Shared Tier Definitions
// Usage: <script src="/js/tiers.js"></script>
// Provides: PRODUCT_TIERS, TIER_NORMALIZE, normalizeTier(), getTierConfig(), tierHasFeature()

const PRODUCT_TIERS = {
  ambassador:   { name: 'Ambassador',   price: 0,    recurring: null, label: 'Free',        badge: 'coral',  adFree: false, saveContact: false, maxLinks: 3,  tagline: false, commerce: false, customDomain: false, analytics: false },
  professional: { name: 'Professional', price: 1900, recurring: null, label: '$19 one-time', badge: 'navy',   adFree: true,  saveContact: true,  maxLinks: 10, tagline: false, commerce: false, customDomain: false, analytics: false },
  founder:      { name: 'Founder',      price: 4900, recurring: 500,  label: '$49 + $5/mo',  badge: 'teal',   adFree: true,  saveContact: true,  maxLinks: -1, tagline: true,  commerce: true,  customDomain: true,  analytics: true  },
  enterprise:   { name: 'Enterprise',   price: null, recurring: null, label: 'Custom',       badge: 'purple', adFree: true,  saveContact: true,  maxLinks: -1, tagline: true,  commerce: true,  customDomain: true,  analytics: true  },
};

// Legacy tier normalization (old Firestore docs may have these)
const TIER_NORMALIZE = {
  'ambassador': 'ambassador', 'professional': 'professional',
  'founder': 'founder', 'enterprise': 'enterprise',
  'free': 'ambassador', 'explorer': 'ambassador',
  'adventurer': 'professional', 'pro': 'professional',
  'mentor': 'founder', 'basic': 'ambassador',
};

function normalizeTier(raw) {
  return TIER_NORMALIZE[(raw || '').toLowerCase()] || 'ambassador';
}

function getTierConfig(tier) {
  return PRODUCT_TIERS[normalizeTier(tier)] || PRODUCT_TIERS.ambassador;
}

function tierHasFeature(tier, feature) {
  const config = getTierConfig(tier);
  return config[feature] || false;
}

// Export to window
window.PRODUCT_TIERS = PRODUCT_TIERS;
window.TIER_NORMALIZE = TIER_NORMALIZE;
window.normalizeTier = normalizeTier;
window.getTierConfig = getTierConfig;
window.tierHasFeature = tierHasFeature;
