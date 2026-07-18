import {
  Allergy,
  Appointment,
  AuthUser,
  Condition,
  LabReport,
  Medication,
  MessageThread,
  Observation,
  Patient,
  Practitioner,
} from '@/types/models';

/**
 * Synthetic (non-PHI) demo data. This exists so the app runs end-to-end without
 * a backend. It mirrors the shapes the FHIR-backed services will return.
 *
 * IMPORTANT: These are entirely fictional records. No real patient data.
 */

function iso(offsetHours: number): string {
  return new Date(Date.now() + offsetHours * 3600_000).toISOString();
}

export const DEMO_CREDENTIALS = {
  patient: { email: 'patient@demo.health', password: 'DemoPatient#2026' },
  provider: { email: 'provider@demo.health', password: 'DemoProvider#2026' },
} as const;

export const mockUsers: Record<'patient' | 'provider', AuthUser> = {
  patient: {
    id: 'user-pat-1',
    role: 'patient',
    displayName: 'Jordan Rivera',
    email: DEMO_CREDENTIALS.patient.email,
    fhirReference: 'patient-1',
    mfaEnrolled: true,
  },
  provider: {
    id: 'user-doc-1',
    role: 'physician',
    displayName: 'Dr. Alex Chen',
    email: DEMO_CREDENTIALS.provider.email,
    fhirReference: 'practitioner-1',
    mfaEnrolled: true,
  },
};

export const mockPatient: Patient = {
  id: 'patient-1',
  name: { given: 'Jordan', family: 'Rivera' },
  birthDate: '1984-03-22',
  gender: 'other',
  bloodType: 'O+',
  phone: '+1 (555) 018-2233',
  email: 'patient@demo.health',
  primaryProviderId: 'practitioner-1',
};

export const mockPractitioners: Practitioner[] = [
  { id: 'practitioner-1', name: { given: 'Alex', family: 'Chen' }, role: 'physician', specialty: 'Family Medicine' },
  { id: 'practitioner-2', name: { given: 'Priya', family: 'Nair' }, role: 'specialist', specialty: 'Cardiology' },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'appt-1',
    patientId: 'patient-1',
    practitionerId: 'practitioner-1',
    practitionerName: 'Dr. Alex Chen',
    type: 'video',
    status: 'confirmed',
    start: iso(26),
    end: iso(26.5),
    reason: 'Diabetes follow-up',
    locationText: 'Video visit',
  },
  {
    id: 'appt-2',
    patientId: 'patient-1',
    practitionerId: 'practitioner-2',
    practitionerName: 'Dr. Priya Nair',
    type: 'in-person',
    status: 'booked',
    start: iso(96),
    end: iso(96.75),
    reason: 'Cardiology consult',
    locationText: 'Main Clinic, Suite 400',
  },
  {
    id: 'appt-3',
    patientId: 'patient-1',
    practitionerId: 'practitioner-1',
    practitionerName: 'Dr. Alex Chen',
    type: 'phone',
    status: 'completed',
    start: iso(-72),
    end: iso(-71.7),
    reason: 'Medication review',
  },
];

export const mockMedications: Medication[] = [
  {
    id: 'med-1',
    patientId: 'patient-1',
    name: 'Metformin',
    dose: '500 mg',
    frequency: 'BID',
    route: 'oral',
    status: 'active',
    prescriberName: 'Dr. Alex Chen',
    indication: 'Type 2 diabetes',
    scheduleTimes: ['08:00', '20:00'],
    refillsRemaining: 2,
  },
  {
    id: 'med-2',
    patientId: 'patient-1',
    name: 'Lisinopril',
    dose: '10 mg',
    frequency: 'Once daily',
    route: 'oral',
    status: 'active',
    prescriberName: 'Dr. Priya Nair',
    indication: 'Hypertension',
    scheduleTimes: ['08:00'],
    refillsRemaining: 0,
  },
  {
    id: 'med-3',
    patientId: 'patient-1',
    name: 'Atorvastatin',
    dose: '20 mg',
    frequency: 'At bedtime',
    route: 'oral',
    status: 'active',
    prescriberName: 'Dr. Priya Nair',
    indication: 'High cholesterol',
    scheduleTimes: ['21:00'],
    refillsRemaining: 5,
  },
];

export const mockAllergies: Allergy[] = [
  {
    id: 'allergy-1',
    patientId: 'patient-1',
    substance: 'Penicillin',
    reaction: 'Hives, difficulty breathing',
    severity: 'severe',
    category: 'medication',
  },
  {
    id: 'allergy-2',
    patientId: 'patient-1',
    substance: 'Peanuts',
    reaction: 'Anaphylaxis',
    severity: 'anaphylaxis',
    category: 'food',
  },
];

export const mockConditions: Condition[] = [
  { id: 'cond-1', patientId: 'patient-1', code: 'E11.9', label: 'Type 2 diabetes mellitus', status: 'chronic', onsetDate: '2019-06-01' },
  { id: 'cond-2', patientId: 'patient-1', code: 'I10', label: 'Essential hypertension', status: 'active', onsetDate: '2021-02-15' },
];

export const mockVitals: Observation[] = [
  { id: 'obs-1', patientId: 'patient-1', code: '8480-6', label: 'Systolic BP', value: 128, unit: 'mmHg', effective: iso(-4), flag: 'normal' },
  { id: 'obs-2', patientId: 'patient-1', code: '8462-4', label: 'Diastolic BP', value: 82, unit: 'mmHg', effective: iso(-4), flag: 'normal' },
  { id: 'obs-3', patientId: 'patient-1', code: '2339-0', label: 'Glucose', value: 142, unit: 'mg/dL', effective: iso(-6), flag: 'high' },
  { id: 'obs-4', patientId: 'patient-1', code: '29463-7', label: 'Weight', value: 78.5, unit: 'kg', effective: iso(-24), flag: 'normal' },
  { id: 'obs-5', patientId: 'patient-1', code: '59408-5', label: 'SpO2', value: 97, unit: '%', effective: iso(-4), flag: 'normal' },
];

export const mockLabReports: LabReport[] = [
  {
    id: 'lab-1',
    patientId: 'patient-1',
    panel: 'Comprehensive Metabolic Panel',
    issued: iso(-48),
    hasAbnormal: true,
    observations: [
      { id: 'lab-1-a', patientId: 'patient-1', code: '2345-7', label: 'Glucose', value: 142, unit: 'mg/dL', effective: iso(-48), flag: 'high' },
      { id: 'lab-1-b', patientId: 'patient-1', code: '2160-0', label: 'Creatinine', value: 0.9, unit: 'mg/dL', effective: iso(-48), flag: 'normal' },
    ],
  },
  {
    id: 'lab-2',
    patientId: 'patient-1',
    panel: 'HbA1c',
    issued: iso(-120),
    hasAbnormal: true,
    observations: [
      { id: 'lab-2-a', patientId: 'patient-1', code: '4548-4', label: 'Hemoglobin A1c', value: 7.4, unit: '%', effective: iso(-120), flag: 'high' },
    ],
  },
];

export const mockThreads: MessageThread[] = [
  {
    id: 'thread-1',
    subject: 'Question about glucose readings',
    participantName: 'Dr. Alex Chen',
    lastMessagePreview: 'Let’s adjust your evening dose. Please monitor for a week.',
    lastMessageAt: iso(-2),
    unreadCount: 1,
  },
  {
    id: 'thread-2',
    subject: 'Lab results follow-up',
    participantName: 'Care Team',
    lastMessagePreview: 'Your CMP results are available to review.',
    lastMessageAt: iso(-30),
    unreadCount: 0,
  },
];
