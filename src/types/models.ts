import { UserRole } from './roles';

/**
 * Domain models. Field names deliberately mirror HL7 FHIR R4 resources
 * (Patient, Practitioner, Appointment, Observation, MedicationRequest,
 * Condition, AllergyIntolerance, Communication) so the service layer can map
 * to/from FHIR with minimal transformation (spec 14.4 / 15.1).
 */

export type ID = string;
export type ISODateTime = string; // e.g. "2026-07-13T15:00:00Z"

export interface AuthUser {
  id: ID;
  role: UserRole;
  displayName: string;
  email: string;
  /** FHIR Patient.id or Practitioner.id this account is linked to. */
  fhirReference: string;
  mfaEnrolled: boolean;
}

export interface HumanName {
  given: string;
  family: string;
}

export interface Patient {
  id: ID;
  name: HumanName;
  birthDate: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | 'unknown';
  photoUrl?: string;
  bloodType?: string;
  phone?: string;
  email?: string;
  primaryProviderId?: ID;
}

export interface Practitioner {
  id: ID;
  name: HumanName;
  role: UserRole;
  specialty?: string;
  photoUrl?: string;
}

export type AppointmentType = 'in-person' | 'video' | 'phone';
export type AppointmentStatus =
  | 'proposed'
  | 'booked'
  | 'confirmed'
  | 'checked-in'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Appointment {
  id: ID;
  patientId: ID;
  practitionerId: ID;
  practitionerName: string;
  type: AppointmentType;
  status: AppointmentStatus;
  start: ISODateTime;
  end: ISODateTime;
  reason: string;
  locationText?: string;
}

/** FHIR Observation — vitals, labs, RPM readings. */
export interface Observation {
  id: ID;
  patientId: ID;
  code: string; // LOINC where possible
  label: string;
  value: number;
  unit: string;
  effective: ISODateTime;
  /** Interpretation flag for abnormal results (spec 3.2, 9.x alert thresholds). */
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export type MedicationStatus = 'active' | 'completed' | 'stopped' | 'on-hold';

export interface Medication {
  id: ID;
  patientId: ID;
  name: string;
  dose: string; // e.g. "500 mg"
  frequency: string; // e.g. "BID"
  route: string; // e.g. "oral"
  status: MedicationStatus;
  prescriberName: string;
  indication?: string;
  /** Scheduled dose times in 24h "HH:mm" for adherence reminders (spec 8.3). */
  scheduleTimes: string[];
  refillsRemaining: number;
}

/** A single logged medication-taking event for adherence tracking. */
export interface MedicationDoseLog {
  medicationId: ID;
  scheduledTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  status: 'taken' | 'skipped' | 'missed';
  loggedAt: ISODateTime;
}

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis';

export interface Allergy {
  id: ID;
  patientId: ID;
  substance: string;
  reaction: string;
  severity: AllergySeverity;
  category: 'medication' | 'food' | 'environment';
}

export interface Condition {
  id: ID;
  patientId: ID;
  code: string; // ICD-10
  label: string;
  status: 'active' | 'resolved' | 'chronic';
  onsetDate?: string;
}

export interface LabReport {
  id: ID;
  patientId: ID;
  panel: string;
  issued: ISODateTime;
  observations: Observation[];
  hasAbnormal: boolean;
}

/** FHIR Communication — secure messaging (spec: secure messaging). */
export interface Message {
  id: ID;
  threadId: ID;
  senderId: ID;
  senderName: string;
  recipientId: ID;
  body: string;
  sentAt: ISODateTime;
  read: boolean;
}

export interface MessageThread {
  id: ID;
  subject: string;
  participantName: string;
  lastMessagePreview: string;
  lastMessageAt: ISODateTime;
  unreadCount: number;
}
