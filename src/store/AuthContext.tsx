import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AuthUser } from '@/types/models';
import {
  clearAllSecureItems,
  getSecureJSON,
  SecureKeys,
  setSecureItem,
  setSecureJSON,
} from '@/security/secureStorage';
import { audit } from '@/security/audit';
import * as authService from '@/services/auth.service';

type AuthStatus = 'loading' | 'signedOut' | 'mfaPending' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  confirmMfa: (code: string) => Promise<void>;
  signOut: (reason?: 'user' | 'timeout') => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);

  // Restore an existing session on cold start.
  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await getSecureJSON<AuthUser>(SecureKeys.sessionUser);
      if (!active) return;
      if (saved) {
        setUser(saved);
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistActor = useCallback(async (u: AuthUser) => {
    // Non-PHI identifiers used only to attribute audit events.
    await setSecureItem('audit.actorId', u.id);
    await setSecureItem('audit.actorRole', u.role);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);
      await setSecureItem(SecureKeys.accessToken, result.accessToken);
      await setSecureItem(SecureKeys.refreshToken, result.refreshToken);
      await persistActor(result.user);

      if (result.mfaRequired) {
        setPendingUser(result.user);
        setStatus('mfaPending');
        await authService.requestMfaCode();
      } else {
        await setSecureJSON(SecureKeys.sessionUser, result.user);
        setUser(result.user);
        setStatus('signedIn');
      }
    },
    [persistActor],
  );

  const confirmMfa = useCallback(
    async (code: string) => {
      if (!pendingUser) throw new Error('No pending MFA challenge.');
      const ok = await authService.verifyMfa(code);
      if (!ok) throw new Error('Invalid verification code.');
      await setSecureJSON(SecureKeys.sessionUser, pendingUser);
      setUser(pendingUser);
      setPendingUser(null);
      setStatus('signedIn');
    },
    [pendingUser],
  );

  const signOut = useCallback(async (reason: 'user' | 'timeout' = 'user') => {
    await audit(reason === 'timeout' ? 'auth.session.timeout' : 'auth.logout');
    await authService.signOutSupabase();
    await clearAllSecureItems();
    setUser(null);
    setPendingUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, confirmMfa, signOut }),
    [status, user, signIn, confirmMfa, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
