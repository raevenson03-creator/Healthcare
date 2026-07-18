/** Supabase table row shapes (snake_case columns). */

export interface ProfileRow {
  id: string;
  role: string;
  display_name: string;
  email: string;
  fhir_reference: string;
  mfa_enrolled: boolean;
}

export interface PatientRow {
  id: string;
  name_given: string;
  name_family: string;
  birth_date: string;
  gender: string;
  blood_type: string | null;
  phone: string | null;
  email: string | null;
  primary_provider_id: string | null;
  photo_url: string | null;
}

export interface PractitionerRow {
  id: string;
  name_given: string;
  name_family: string;
  role: string;
  specialty: string | null;
  photo_url: string | null;
}

export interface AppointmentRow {
  id: string;
  patient_id: string;
  practitioner_id: string;
  practitioner_name: string;
  type: string;
  status: string;
  start_at: string;
  end_at: string;
  reason: string;
  location_text: string | null;
}

export interface MedicationRow {
  id: string;
  patient_id: string;
  name: string;
  dose: string;
  frequency: string;
  route: string;
  status: string;
  prescriber_name: string;
  indication: string | null;
  schedule_times: string[];
  refills_remaining: number;
}

export interface AllergyRow {
  id: string;
  patient_id: string;
  substance: string;
  reaction: string;
  severity: string;
  category: string;
}

export interface ConditionRow {
  id: string;
  patient_id: string;
  code: string;
  label: string;
  status: string;
  onset_date: string | null;
}

export interface ObservationRow {
  id: string;
  patient_id: string;
  lab_report_id: string | null;
  code: string;
  label: string;
  value: number;
  unit: string;
  effective_at: string;
  flag: string | null;
}

export interface LabReportRow {
  id: string;
  patient_id: string;
  panel: string;
  issued_at: string;
  has_abnormal: boolean;
}

export interface MessageThreadRow {
  id: string;
  subject: string;
  participant_name: string;
  last_message_preview: string;
  last_message_at: string;
  unread_count: number;
}
