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
  Practitioner,
} from '@/types/models';
import { audit } from '@/security/audit';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import {
  mapAllergy,
  mapAppointment,
  mapCondition,
  mapLabReport,
  mapMedication,
  mapMessageThread,
  mapObservation,
  mapPatient,
  mapPractitioner,
  toAppointmentInsert,
} from '@/services/supabase/mappers';
import {
  mockAllergies,
  mockAppointments,
  mockConditions,
  mockLabReports,
  mockMedications,
  mockPatient,
  mockPractitioners,
  mockThreads,
  mockVitals,
} from './mockData';

/**
 * Clinical data service backed by Supabase (Postgres).
 * Falls back to in-memory mock data when Supabase is not configured.
 *
 * Every read is audited (spec 1.1 "Audit Controls"). Writes go through the
 * same audit path.
 */

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// Mock fallback mutable state
let mockAppointmentsState = [...mockAppointments];

export async function getPractitioners(): Promise<Practitioner[]> {
  if (!isSupabaseConfigured()) {
    await delay(200);
    return mockPractitioners;
  }

  const { data, error } = await getSupabase().from('practitioners').select('*').order('name_family');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPractitioner);
}

export async function getPatient(patientId: ID): Promise<Patient> {
  if (!isSupabaseConfigured()) {
    await delay();
    await audit('phi.view', { resource: `Patient/${patientId}` });
    return mockPatient;
  }

  const { data, error } = await getSupabase()
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();
  if (error) throw new Error(error.message);
  await audit('phi.view', { resource: `Patient/${patientId}` });
  return mapPatient(data);
}

export async function getAppointments(patientId: ID): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) {
    await delay();
    await audit('phi.view', { resource: `Appointment?patient=${patientId}` });
    return [...mockAppointmentsState]
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  const { data, error } = await getSupabase()
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('start_at');
  if (error) throw new Error(error.message);
  await audit('phi.view', { resource: `Appointment?patient=${patientId}` });
  return (data ?? []).map(mapAppointment);
}

export async function bookAppointment(
  input: Omit<Appointment, 'id' | 'status'>,
): Promise<Appointment> {
  if (!isSupabaseConfigured()) {
    await delay();
    const created: Appointment = { ...input, id: `appt-${Date.now()}`, status: 'booked' };
    mockAppointmentsState = [...mockAppointmentsState, created];
    await audit('phi.create', { resource: `Appointment/${created.id}` });
    return created;
  }

  const { data, error } = await getSupabase()
    .from('appointments')
    .insert(toAppointmentInsert(input))
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  const created = mapAppointment(data);
  await audit('phi.create', { resource: `Appointment/${created.id}` });
  return created;
}

export async function cancelAppointment(id: ID): Promise<void> {
  if (!isSupabaseConfigured()) {
    await delay(200);
    mockAppointmentsState = mockAppointmentsState.map((a) =>
      a.id === id ? { ...a, status: 'cancelled' } : a,
    );
    await audit('phi.update', { resource: `Appointment/${id}`, detail: 'status=cancelled' });
    return;
  }

  const { error } = await getSupabase()
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw new Error(error.message);
  await audit('phi.update', { resource: `Appointment/${id}`, detail: 'status=cancelled' });
}

export async function getMedications(patientId: ID): Promise<Medication[]> {
  if (!isSupabaseConfigured()) {
    await delay();
    await audit('phi.view', { resource: `MedicationRequest?patient=${patientId}` });
    return [...mockMedications];
  }

  const { data, error } = await getSupabase()
    .from('medications')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw new Error(error.message);
  await audit('phi.view', { resource: `MedicationRequest?patient=${patientId}` });
  return (data ?? []).map(mapMedication);
}

export async function requestRefill(medicationId: ID): Promise<void> {
  await delay();
  await audit('phi.update', {
    resource: `MedicationRequest/${medicationId}`,
    detail: 'refill.requested',
  });
}

export async function getAllergies(patientId: ID): Promise<Allergy[]> {
  if (!isSupabaseConfigured()) {
    await delay(200);
    await audit('phi.view', { resource: `AllergyIntolerance?patient=${patientId}` });
    return mockAllergies;
  }

  const { data, error } = await getSupabase()
    .from('allergies')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw new Error(error.message);
  await audit('phi.view', { resource: `AllergyIntolerance?patient=${patientId}` });
  return (data ?? []).map(mapAllergy);
}

export async function getConditions(patientId: ID): Promise<Condition[]> {
  if (!isSupabaseConfigured()) {
    await delay(200);
    await audit('phi.view', { resource: `Condition?patient=${patientId}` });
    return mockConditions;
  }

  const { data, error } = await getSupabase()
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw new Error(error.message);
  await audit('phi.view', { resource: `Condition?patient=${patientId}` });
  return (data ?? []).map(mapCondition);
}

export async function getVitals(patientId: ID): Promise<Observation[]> {
  if (!isSupabaseConfigured()) {
    await delay(200);
    await audit('phi.view', { resource: `Observation?patient=${patientId}&category=vital-signs` });
    return mockVitals;
  }

  const { data, error } = await getSupabase()
    .from('observations')
    .select('*')
    .eq('patient_id', patientId)
    .is('lab_report_id', null)
    .order('effective_at', { ascending: false });
  if (error) throw new Error(error.message);
  await audit('phi.view', { resource: `Observation?patient=${patientId}&category=vital-signs` });
  return (data ?? []).map(mapObservation);
}

export async function getLabReports(patientId: ID): Promise<LabReport[]> {
  if (!isSupabaseConfigured()) {
    await delay();
    await audit('phi.view', { resource: `DiagnosticReport?patient=${patientId}` });
    return mockLabReports;
  }

  const supabase = getSupabase();
  const { data: reports, error: reportsError } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('patient_id', patientId)
    .order('issued_at', { ascending: false });
  if (reportsError) throw new Error(reportsError.message);

  const { data: obs, error: obsError } = await supabase
    .from('observations')
    .select('*')
    .eq('patient_id', patientId)
    .not('lab_report_id', 'is', null);
  if (obsError) throw new Error(obsError.message);

  await audit('phi.view', { resource: `DiagnosticReport?patient=${patientId}` });
  return (reports ?? []).map((report) =>
    mapLabReport(
      report,
      (obs ?? []).filter((o) => o.lab_report_id === report.id),
    ),
  );
}

export async function getMessageThreads(): Promise<MessageThread[]> {
  if (!isSupabaseConfigured()) {
    await delay(200);
    return mockThreads;
  }

  const { data, error } = await getSupabase()
    .from('message_threads')
    .select('*')
    .order('last_message_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMessageThread);
}
