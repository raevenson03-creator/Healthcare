import {
  Allergy,
  Appointment,
  Condition,
  ID,
  LabReport,
  Medication,
  MessageThread,
  Observation,
  Patient,
} from '@/types/models';
import { audit } from '@/security/audit';
import {
  mockAllergies,
  mockAppointments,
  mockConditions,
  mockLabReports,
  mockMedications,
  mockPatient,
  mockThreads,
  mockVitals,
} from './mockData';

/**
 * Clinical data service. The demo returns synthetic data from an in-memory
 * store; the production implementation maps FHIR resources via the api client.
 *
 * Every read is audited (spec 1.1 "Audit Controls"). Writes go through the
 * same audit path.
 */

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// A mutable copy so demo interactions (booking, refills) feel real.
let appointments = [...mockAppointments];
let medications = [...mockMedications];

export async function getPatient(patientId: ID): Promise<Patient> {
  await delay();
  await audit('phi.view', { resource: `Patient/${patientId}` });
  return mockPatient;
}

export async function getAppointments(patientId: ID): Promise<Appointment[]> {
  await delay();
  await audit('phi.view', { resource: `Appointment?patient=${patientId}` });
  return [...appointments].sort((a, b) => a.start.localeCompare(b.start));
}

export async function bookAppointment(
  input: Omit<Appointment, 'id' | 'status'>,
): Promise<Appointment> {
  await delay();
  const created: Appointment = { ...input, id: `appt-${Date.now()}`, status: 'booked' };
  appointments = [...appointments, created];
  await audit('phi.create', { resource: `Appointment/${created.id}` });
  return created;
}

export async function cancelAppointment(id: ID): Promise<void> {
  await delay(200);
  appointments = appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a));
  await audit('phi.update', { resource: `Appointment/${id}`, detail: 'status=cancelled' });
}

export async function getMedications(patientId: ID): Promise<Medication[]> {
  await delay();
  await audit('phi.view', { resource: `MedicationRequest?patient=${patientId}` });
  return [...medications];
}

export async function requestRefill(medicationId: ID): Promise<void> {
  await delay();
  await audit('phi.update', { resource: `MedicationRequest/${medicationId}`, detail: 'refill.requested' });
}

export async function getAllergies(patientId: ID): Promise<Allergy[]> {
  await delay(200);
  await audit('phi.view', { resource: `AllergyIntolerance?patient=${patientId}` });
  return mockAllergies;
}

export async function getConditions(patientId: ID): Promise<Condition[]> {
  await delay(200);
  await audit('phi.view', { resource: `Condition?patient=${patientId}` });
  return mockConditions;
}

export async function getVitals(patientId: ID): Promise<Observation[]> {
  await delay(200);
  await audit('phi.view', { resource: `Observation?patient=${patientId}&category=vital-signs` });
  return mockVitals;
}

export async function getLabReports(patientId: ID): Promise<LabReport[]> {
  await delay();
  await audit('phi.view', { resource: `DiagnosticReport?patient=${patientId}` });
  return mockLabReports;
}

export async function getMessageThreads(): Promise<MessageThread[]> {
  await delay(200);
  return mockThreads;
}
