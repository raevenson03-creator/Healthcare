import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/store/AuthContext';
import { AuthStackParamList } from './types';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { MfaScreen } from '@/features/auth/MfaScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const { status } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === 'mfaPending' ? (
        <Stack.Screen name="Mfa" component={MfaScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
