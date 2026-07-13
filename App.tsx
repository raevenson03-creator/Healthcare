import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/store/AuthContext';
import { SessionProvider } from '@/store/SessionContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <SessionProvider>
              <StatusBar style="auto" />
              <RootNavigator />
            </SessionProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
