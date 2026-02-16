#!/usr/bin/env node
// Seed test profiles into Firestore via REST API
// Uses anonymous auth (no service account needed)
// Usage: node scripts/seed-test-profiles.js

const API_KEY = 'AIzaSyAnlmGZNwoPS-vBnK1AlHvNsB73q0UAkCU';
const PROJECT_ID = 'simpli-fi-id';

async function getAnonymousToken() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true })
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.idToken;
}

async function createDocument(token, collection, docId, fields) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  if (!res.ok) throw new Error(`Firestore write failed: ${res.status} ${await res.text()}`);
  return await res.json();
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    if (val.__serverTimestamp) return { timestampValue: new Date().toISOString() };
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) fields[k] = toFirestoreValue(v);
  }
  return fields;
}

const SERVER_TS = { __serverTimestamp: true };

const testProfiles = [
  {
    slug: 'test-ambassador.user.0001',
    data: {
      full_name: 'Test Ambassador',
      first_name: 'Test',
      last_name: 'Ambassador',
      title: 'QA Tester',
      company: '',
      tagline: '',
      bio: 'A test profile for the Ambassador (free) tier.',
      mission: 'Testing the Simpli-FI ID pipeline end-to-end.',
      email: 'test-ambassador@simpli-fi-os.com',
      phone: '(940) 555-0001',
      location: 'Denton, TX',
      social_links: {
        website: '',
        primary: { platform: 'linkedin', url: 'https://linkedin.com/in/test-ambassador' }
      },
      payment_link: '',
      custom_color: '#1e293b',
      tier: 'ambassador',
      slug: 'test-ambassador.user.0001',
      doc_id: 'test-ambassador.user.0001',
      avatar_url: '',
      logo_url: '',
      is_active: true,
      scan_count: 0,
      created_at: SERVER_TS,
      updated_at: SERVER_TS
    }
  },
  {
    slug: 'test-jane.professional.0002',
    data: {
      full_name: 'Jane Professional',
      first_name: 'Jane',
      last_name: 'Professional',
      title: 'Marketing Director',
      company: 'Acme Corp',
      tagline: '',
      bio: 'A test profile for the Professional ($19) tier.',
      mission: 'Connecting marketing professionals with growth opportunities.',
      email: 'jane@acme-corp.com',
      phone: '(214) 555-0002',
      location: 'Dallas, TX',
      social_links: {
        website: 'https://www.acme-corp.com',
        primary: { platform: 'linkedin', url: 'https://linkedin.com/in/jane-professional' }
      },
      payment_link: '',
      custom_color: '#003b46',
      tier: 'professional',
      slug: 'test-jane.professional.0002',
      doc_id: 'test-jane.professional.0002',
      avatar_url: '',
      logo_url: '',
      is_active: true,
      scan_count: 0,
      created_at: SERVER_TS,
      updated_at: SERVER_TS
    }
  },
  {
    slug: 'test-bob.founder.0003',
    data: {
      full_name: 'Bob Founder',
      first_name: 'Bob',
      last_name: 'Founder',
      title: 'CEO',
      company: 'Startup Inc',
      tagline: 'Innovation meets execution. Building the future.',
      bio: 'A test profile for the Founder ($49+$5/mo) tier with all features enabled.',
      mission: 'Scaling a startup from zero to hero, one connection at a time.',
      email: 'bob@startup-inc.com',
      phone: '(512) 555-0003',
      location: 'Austin, TX',
      social_links: {
        website: 'https://www.startup-inc.com',
        primary: { platform: 'twitter', url: 'https://twitter.com/bobfounder' }
      },
      payment_link: 'https://venmo.com/bob-founder',
      custom_color: '#0d9488',
      tier: 'founder',
      slug: 'test-bob.founder.0003',
      doc_id: 'test-bob.founder.0003',
      avatar_url: '',
      logo_url: '',
      is_active: true,
      scan_count: 0,
      created_at: SERVER_TS,
      updated_at: SERVER_TS
    }
  }
];

async function seed() {
  console.log('Authenticating anonymously...');
  const token = await getAnonymousToken();
  console.log('Authenticated. Seeding test profiles...\n');

  for (const profile of testProfiles) {
    try {
      const fields = toFirestoreFields(profile.data);
      await createDocument(token, 'users', profile.slug, fields);
      console.log(`  ✓ Created: ${profile.data.full_name} (${profile.data.tier}) → ${profile.slug}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${profile.slug} — ${err.message}`);
    }
  }

  console.log('\nDone! View cards at:');
  testProfiles.forEach(p => {
    console.log(`  → /card.html?u=${p.slug}`);
  });
}

seed().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
