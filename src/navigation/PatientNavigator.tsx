import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
import {
  AppointmentsStackParamList,
  PatientTabParamList,
  RecordsStackParamList,
} from './types';
import { TabBarIcon } from './TabBarIcon';
import { DashboardScreen } from '@/features/patient/DashboardScreen';
import { AppointmentsListScreen } from '@/features/patient/appointments/AppointmentsListScreen';
import { BookAppointmentScreen } from '@/features/patient/appointments/BookAppointmentScreen';
import { AppointmentDetailScreen } from '@/features/patient/appointments/AppointmentDetailScreen';
import { RecordsOverviewScreen } from '@/features/patient/records/RecordsOverviewScreen';
import { VitalsScreen } from '@/features/patient/records/VitalsScreen';
import { LabResultsScreen } from '@/features/patient/records/LabResultsScreen';
import { MedicationsScreen } from '@/features/patient/MedicationsScreen';
import { MessagesScreen } from '@/features/shared/MessagesScreen';
import { MoreScreen } from '@/features/shared/MoreScreen';

const Tab = createBottomTabNavigator<PatientTabParamList>();
const AppointmentsStack = createNativeStackNavigator<AppointmentsStackParamList>();
const RecordsStack = createNativeStackNavigator<RecordsStackParamList>();

function AppointmentsNavigator() {
  return (
    <AppointmentsStack.Navigator>
      <AppointmentsStack.Screen
        name="AppointmentsList"
        component={AppointmentsListScreen}
        options={{ title: 'Appointments' }}
      />
      <AppointmentsStack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{ title: 'Book Appointment' }}
      />
      <AppointmentsStack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Appointment' }}
      />
    </AppointmentsStack.Navigator>
  );
}

function RecordsNavigator() {
  return (
    <RecordsStack.Navigator>
      <RecordsStack.Screen
        name="RecordsOverview"
        component={RecordsOverviewScreen}
        options={{ title: 'Health Records' }}
      />
      <RecordsStack.Screen name="Vitals" component={VitalsScreen} options={{ title: 'Vitals' }} />
      <RecordsStack.Screen
        name="LabResults"
        component={LabResultsScreen}
        options={{ title: 'Lab Results' }}
      />
      <RecordsStack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{ title: 'Medications' }}
      />
    </RecordsStack.Navigator>
  );
}

export function PatientNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="🏠" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="📅" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Records"
        component={RecordsNavigator}
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="📋" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="💬" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="⚙️" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
