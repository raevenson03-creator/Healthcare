#!/usr/bin/env node
/**
 * Creates demo auth users + profiles in Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/setup-demo-users.mjs
 *
 * Requires the service role key (server-side only — never ship in the app).
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const DEMO_USERS = [
  {
    email: 'patient@demo.health',
    password: 'DemoPatient#2026',
    profile: {
      role: 'patient',
      display_name: 'Jordan Rivera',
      fhir_reference: 'patient-1',
      mfa_enrolled: true,
    },
  },
  {
    email: 'provider@demo.health',
    password: 'DemoProvider#2026',
    profile: {
      role: 'physician',
      display_name: 'Dr. Alex Chen',
      fhir_reference: 'practitioner-1',
      mfa_enrolled: true,
    },
  },
];

async function api(path, options = {}) {
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${path}: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function upsertUser({ email, password, profile }) {
  const existing = await api(`/auth/v1/admin/users?email=${encodeURIComponent(email)}`);
  let userId = existing?.users?.[0]?.id;

  if (!userId) {
    const created = await api('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    userId = created.id;
    console.log(`Created auth user: ${email}`);
  } else {
    console.log(`Auth user exists: ${email}`);
  }

  await api('/rest/v1/profiles', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: userId,
      email,
      ...profile,
    }),
  });
  console.log(`Upserted profile for ${email}`);
}

async function main() {
  for (const user of DEMO_USERS) {
    await upsertUser(user);
  }
  console.log('\nDone. Run supabase/seed.sql next to load clinical data.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
