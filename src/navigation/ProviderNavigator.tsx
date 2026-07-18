import { Platform } from 'react-native';
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.isDark ? theme.colors.surfaceAlt : '#E8EFED',
          borderTopColor: theme.colors.primary,
          borderTopWidth: 2,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Today: 'medkit' as const,
            Schedule: 'calendar' as const,
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
      <Tab.Screen name="Today" component={TodayNavigator} options={{ title: 'Clinical' }} />
      <Tab.Screen name="Schedule" component={ProviderScheduleScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
