import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Mfa: undefined;
};

export type AppointmentsStackParamList = {
  AppointmentsList: undefined;
  BookAppointment: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type RecordsStackParamList = {
  RecordsOverview: undefined;
  Vitals: undefined;
  LabResults: undefined;
  Medications: undefined;
};

export type PatientTabParamList = {
  Dashboard: undefined;
  Appointments: NavigatorScreenParams<AppointmentsStackParamList>;
  Records: NavigatorScreenParams<RecordsStackParamList>;
  Messages: undefined;
  More: undefined;
};

export type ProviderStackParamList = {
  ProviderDashboard: undefined;
  PatientChart: { patientId: string };
  Prescribe: { patientId: string };
};

export type ProviderTabParamList = {
  Today: NavigatorScreenParams<ProviderStackParamList>;
  Schedule: undefined;
  Messages: undefined;
  More: undefined;
};
