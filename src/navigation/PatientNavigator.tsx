import { Platform } from 'react-native';
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          ...(Platform.OS === 'web'
            ? { boxShadow: `0 -4px 20px ${theme.colors.shadow}` }
            : {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                elevation: 8,
              }),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Dashboard: 'home' as const,
            Appointments: 'calendar' as const,
            Records: 'folder-open' as const,
            Messages: 'chatbubbles' as const,
            More: 'settings' as const,
          };
          return (
            <TabBarIcon
              name={icons[route.name as keyof typeof icons]}
              color={color}
              size={size}
              focused={focused}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Appointments" component={AppointmentsNavigator} options={{ title: 'Visits' }} />
      <Tab.Screen name="Records" component={RecordsNavigator} options={{ title: 'Records' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
