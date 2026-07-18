-- CareBridge Health — seed synthetic demo data
-- Run AFTER schema.sql and AFTER creating demo auth users (see scripts/setup-demo-users.mjs).

-- Clear existing demo rows (idempotent re-seed)
DELETE FROM observations;
DELETE FROM lab_reports;
DELETE FROM message_threads;
DELETE FROM medications;
DELETE FROM allergies;
DELETE FROM conditions;
DELETE FROM appointments;
DELETE FROM patients;
DELETE FROM practitioners;

-- Practitioners
INSERT INTO practitioners (id, name_given, name_family, role, specialty) VALUES
  ('practitioner-1', 'Alex', 'Chen', 'physician', 'Family Medicine'),
  ('practitioner-2', 'Priya', 'Nair', 'specialist', 'Cardiology');

-- Patient
INSERT INTO patients (id, name_given, name_family, birth_date, gender, blood_type, phone, email, primary_provider_id) VALUES
  ('patient-1', 'Jordan', 'Rivera', '1984-03-22', 'other', 'O+', '+1 (555) 018-2233', 'patient@demo.health', 'practitioner-1');

-- Appointments (relative timestamps)
INSERT INTO appointments (id, patient_id, practitioner_id, practitioner_name, type, status, start_at, end_at, reason, location_text) VALUES
  ('appt-1', 'patient-1', 'practitioner-1', 'Dr. Alex Chen', 'video', 'confirmed',
   now() + interval '26 hours', now() + interval '26 hours 30 minutes', 'Diabetes follow-up', 'Video visit'),
  ('appt-2', 'patient-1', 'practitioner-2', 'Dr. Priya Nair', 'in-person', 'booked',
   now() + interval '96 hours', now() + interval '96 hours 45 minutes', 'Cardiology consult', 'Main Clinic, Suite 400'),
  ('appt-3', 'patient-1', 'practitioner-1', 'Dr. Alex Chen', 'phone', 'completed',
   now() - interval '72 hours', now() - interval '71 hours 18 minutes', 'Medication review', NULL);

-- Medications
INSERT INTO medications (id, patient_id, name, dose, frequency, route, status, prescriber_name, indication, schedule_times, refills_remaining) VALUES
  ('med-1', 'patient-1', 'Metformin', '500 mg', 'BID', 'oral', 'active', 'Dr. Alex Chen', 'Type 2 diabetes', ARRAY['08:00', '20:00'], 2),
  ('med-2', 'patient-1', 'Lisinopril', '10 mg', 'Once daily', 'oral', 'active', 'Dr. Priya Nair', 'Hypertension', ARRAY['08:00'], 0),
  ('med-3', 'patient-1', 'Atorvastatin', '20 mg', 'At bedtime', 'oral', 'active', 'Dr. Priya Nair', 'High cholesterol', ARRAY['21:00'], 5);

-- Allergies
INSERT INTO allergies (id, patient_id, substance, reaction, severity, category) VALUES
  ('allergy-1', 'patient-1', 'Penicillin', 'Hives, difficulty breathing', 'severe', 'medication'),
  ('allergy-2', 'patient-1', 'Peanuts', 'Anaphylaxis', 'anaphylaxis', 'food');

-- Conditions
INSERT INTO conditions (id, patient_id, code, label, status, onset_date) VALUES
  ('cond-1', 'patient-1', 'E11.9', 'Type 2 diabetes mellitus', 'chronic', '2019-06-01'),
  ('cond-2', 'patient-1', 'I10', 'Essential hypertension', 'active', '2021-02-15');

-- Vitals (observations without lab_report_id)
INSERT INTO observations (id, patient_id, code, label, value, unit, effective_at, flag) VALUES
  ('obs-1', 'patient-1', '8480-6', 'Systolic BP', 128, 'mmHg', now() - interval '4 hours', 'normal'),
  ('obs-2', 'patient-1', '8462-4', 'Diastolic BP', 82, 'mmHg', now() - interval '4 hours', 'normal'),
  ('obs-3', 'patient-1', '2339-0', 'Glucose', 142, 'mg/dL', now() - interval '6 hours', 'high'),
  ('obs-4', 'patient-1', '29463-7', 'Weight', 78.5, 'kg', now() - interval '24 hours', 'normal'),
  ('obs-5', 'patient-1', '59408-5', 'SpO2', 97, '%', now() - interval '4 hours', 'normal');

-- Lab reports
INSERT INTO lab_reports (id, patient_id, panel, issued_at, has_abnormal) VALUES
  ('lab-1', 'patient-1', 'Comprehensive Metabolic Panel', now() - interval '48 hours', true),
  ('lab-2', 'patient-1', 'HbA1c', now() - interval '120 hours', true);

INSERT INTO observations (id, patient_id, lab_report_id, code, label, value, unit, effective_at, flag) VALUES
  ('lab-1-a', 'patient-1', 'lab-1', '2345-7', 'Glucose', 142, 'mg/dL', now() - interval '48 hours', 'high'),
  ('lab-1-b', 'patient-1', 'lab-1', '2160-0', 'Creatinine', 0.9, 'mg/dL', now() - interval '48 hours', 'normal'),
  ('lab-2-a', 'patient-1', 'lab-2', '4548-4', 'Hemoglobin A1c', 7.4, '%', now() - interval '120 hours', 'high');

-- Message threads
INSERT INTO message_threads (id, subject, participant_name, last_message_preview, last_message_at, unread_count) VALUES
  ('thread-1', 'Question about glucose readings', 'Dr. Alex Chen',
   'Let''s adjust your evening dose. Please monitor for a week.', now() - interval '2 hours', 1),
  ('thread-2', 'Lab results follow-up', 'Care Team',
   'Your CMP results are available to review.', now() - interval '30 hours', 0);
