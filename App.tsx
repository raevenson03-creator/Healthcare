import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { PersonaThemeProvider } from '@/theme/PersonaThemeProvider';
import { AuthProvider } from '@/store/AuthContext';
import { SessionProvider } from '@/store/SessionContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <PersonaThemeProvider>
              <SessionProvider>
                <StatusBar style="auto" />
                <RootNavigator />
              </SessionProvider>
            </PersonaThemeProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
