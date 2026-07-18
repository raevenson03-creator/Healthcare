-- CareBridge Health — Supabase schema
-- Run in the Supabase SQL editor (Dashboard → SQL → New query).

-- ---------------------------------------------------------------------------
-- Profiles (extends Supabase Auth users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'physician', 'specialist', 'nurse', 'admin')),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  fhir_reference TEXT NOT NULL,
  mfa_enrolled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Clinical entities (synthetic demo data — no real PHI)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name_given TEXT NOT NULL,
  name_family TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  blood_type TEXT,
  phone TEXT,
  email TEXT,
  primary_provider_id TEXT,
  photo_url TEXT
);

CREATE TABLE IF NOT EXISTS practitioners (
  id TEXT PRIMARY KEY,
  name_given TEXT NOT NULL,
  name_family TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  photo_url TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  practitioner_id TEXT NOT NULL REFERENCES practitioners(id),
  practitioner_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in-person', 'video', 'phone')),
  status TEXT NOT NULL CHECK (status IN ('proposed', 'booked', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  location_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'stopped', 'on-hold')),
  prescriber_name TEXT NOT NULL,
  indication TEXT,
  schedule_times TEXT[] NOT NULL DEFAULT '{}',
  refills_remaining INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS allergies (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  substance TEXT NOT NULL,
  reaction TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'anaphylaxis')),
  category TEXT NOT NULL CHECK (category IN ('medication', 'food', 'environment'))
);

CREATE TABLE IF NOT EXISTS conditions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'chronic')),
  onset_date DATE
);

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  lab_report_id TEXT,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  flag TEXT CHECK (flag IN ('normal', 'high', 'low', 'critical'))
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  panel TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  has_abnormal BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE observations
  ADD CONSTRAINT observations_lab_report_id_fkey
  FOREIGN KEY (lab_report_id) REFERENCES lab_reports(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS message_threads (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  last_message_preview TEXT NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL,
  unread_count INT NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_observations_patient ON observations(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient ON lab_reports(patient_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (demo — authenticated users can read/write demo data)
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "clinical_select_authenticated" ON patients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_practitioners" ON practitioners
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_appointments" ON appointments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_medications" ON medications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_allergies" ON allergies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_conditions" ON conditions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_observations" ON observations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_lab_reports" ON lab_reports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clinical_select_authenticated_threads" ON message_threads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "appointments_insert_authenticated" ON appointments
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "appointments_update_authenticated" ON appointments
  FOR UPDATE TO authenticated USING (true);
