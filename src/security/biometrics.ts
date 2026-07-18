import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Biometric authentication (spec 2.2). Biometric templates are handled entirely
 * by the OS secure enclave and are NEVER transmitted or stored by the app.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

export async function authenticateWithBiometrics(
  promptMessage = 'Unlock CareBridge',
): Promise<boolean> {
  const available = await isBiometricAvailable();
  if (!available) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });
  return result.success;
}
