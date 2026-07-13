import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
import { ProviderStackParamList, ProviderTabParamList } from './types';
import { TabBarIcon } from './TabBarIcon';
import { ProviderDashboardScreen } from '@/features/provider/ProviderDashboardScreen';
import { PatientChartScreen } from '@/features/provider/PatientChartScreen';
import { PrescribeScreen } from '@/features/provider/PrescribeScreen';
import { ProviderScheduleScreen } from '@/features/provider/ProviderScheduleScreen';
import { MessagesScreen } from '@/features/shared/MessagesScreen';
import { MoreScreen } from '@/features/shared/MoreScreen';

const Tab = createBottomTabNavigator<ProviderTabParamList>();
const Stack = createNativeStackNavigator<ProviderStackParamList>();

function TodayNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProviderDashboard"
        component={ProviderDashboardScreen}
        options={{ title: 'Today' }}
      />
      <Stack.Screen
        name="PatientChart"
        component={PatientChartScreen}
        options={{ title: 'Patient Chart' }}
      />
      <Stack.Screen name="Prescribe" component={PrescribeScreen} options={{ title: 'New Prescription' }} />
    </Stack.Navigator>
  );
}

export function ProviderNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="🩺" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ProviderScheduleScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabBarIcon symbol="📅" color={color} size={size} />,
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
