import { View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';

import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useSession } from '@/store/SessionContext';
import { PROVIDER_ROLES } from '@/types/roles';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { ProviderNavigator } from './ProviderNavigator';
import { SplashScreen } from '@/features/auth/SplashScreen';

export function RootNavigator() {
  const theme = useTheme();
  const { status, user } = useAuth();
  const { reportActivity } = useSession();

  const navTheme: NavTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme : DefaultTheme).colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
      notification: theme.colors.danger,
    },
  };

  const renderContent = () => {
    if (status === 'loading') return <SplashScreen />;
    if (status !== 'signedIn' || !user) return <AuthNavigator />;
    return PROVIDER_ROLES.includes(user.role) ? <ProviderNavigator /> : <PatientNavigator />;
  };

  return (
    // Any touch anywhere resets the HIPAA idle-logoff timer (spec 1.1).
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={() => {
        reportActivity();
        return false;
      }}
    >
      <NavigationContainer theme={navTheme}>{renderContent()}</NavigationContainer>
    </View>
  );
}
