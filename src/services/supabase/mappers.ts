import {
  Allergy,
  Appointment,
  AppointmentStatus,
  AppointmentType,
  AuthUser,
  Condition,
  LabReport,
  Medication,
  MedicationStatus,
  MessageThread,
  Observation,
  Patient,
  Practitioner,
} from '@/types/models';
import { UserRole } from '@/types/roles';
import {
  AllergyRow,
  AppointmentRow,
  ConditionRow,
  LabReportRow,
  MedicationRow,
  MessageThreadRow,
  ObservationRow,
  PatientRow,
  PractitionerRow,
  ProfileRow,
} from './types';

export function mapProfile(row: ProfileRow): AuthUser {
  return {
    id: row.id,
    role: row.role as UserRole,
    displayName: row.display_name,
    email: row.email,
    fhirReference: row.fhir_reference,
    mfaEnrolled: row.mfa_enrolled,
  };
}

export function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: { given: row.name_given, family: row.name_family },
    birthDate: row.birth_date,
    gender: row.gender as Patient['gender'],
    bloodType: row.blood_type ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    primaryProviderId: row.primary_provider_id ?? undefined,
    photoUrl: row.photo_url ?? undefined,
  };
}

export function mapPractitioner(row: PractitionerRow): Practitioner {
  return {
    id: row.id,
    name: { given: row.name_given, family: row.name_family },
    role: row.role as UserRole,
    specialty: row.specialty ?? undefined,
    photoUrl: row.photo_url ?? undefined,
  };
}

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    practitionerId: row.practitioner_id,
    practitionerName: row.practitioner_name,
    type: row.type as AppointmentType,
    status: row.status as AppointmentStatus,
    start: row.start_at,
    end: row.end_at,
    reason: row.reason,
    locationText: row.location_text ?? undefined,
  };
}

export function mapMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    patientId: row.patient_id,
    name: row.name,
    dose: row.dose,
    frequency: row.frequency,
    route: row.route,
    status: row.status as MedicationStatus,
    prescriberName: row.prescriber_name,
    indication: row.indication ?? undefined,
    scheduleTimes: row.schedule_times,
    refillsRemaining: row.refills_remaining,
  };
}

export function mapAllergy(row: AllergyRow): Allergy {
  return {
    id: row.id,
    patientId: row.patient_id,
    substance: row.substance,
    reaction: row.reaction,
    severity: row.severity as Allergy['severity'],
    category: row.category as Allergy['category'],
  };
}

export function mapCondition(row: ConditionRow): Condition {
  return {
    id: row.id,
    patientId: row.patient_id,
    code: row.code,
    label: row.label,
    status: row.status as Condition['status'],
    onsetDate: row.onset_date ?? undefined,
  };
}

export function mapObservation(row: ObservationRow): Observation {
  return {
    id: row.id,
    patientId: row.patient_id,
    code: row.code,
    label: row.label,
    value: Number(row.value),
    unit: row.unit,
    effective: row.effective_at,
    flag: (row.flag as Observation['flag']) ?? undefined,
  };
}

export function mapLabReport(row: LabReportRow, observations: ObservationRow[]): LabReport {
  return {
    id: row.id,
    patientId: row.patient_id,
    panel: row.panel,
    issued: row.issued_at,
    hasAbnormal: row.has_abnormal,
    observations: observations.map(mapObservation),
  };
}

export function mapMessageThread(row: MessageThreadRow): MessageThread {
  return {
    id: row.id,
    subject: row.subject,
    participantName: row.participant_name,
    lastMessagePreview: row.last_message_preview,
    lastMessageAt: row.last_message_at,
    unreadCount: row.unread_count,
  };
}

export function toAppointmentInsert(
  input: Omit<Appointment, 'id' | 'status'>,
): Omit<AppointmentRow, 'id'> {
  return {
    patient_id: input.patientId,
    practitioner_id: input.practitionerId,
    practitioner_name: input.practitionerName,
    type: input.type,
    status: 'booked',
    start_at: input.start,
    end_at: input.end,
    reason: input.reason,
    location_text: input.locationText ?? null,
  };
}
