import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { env } from '@/config/env';
import { useAuth } from './AuthContext';

/**
 * Automatic logoff (spec 1.1 / 13.2).
 *
 * Enforces two timers while signed in:
 *   - Idle timeout: 15 min without user interaction -> sign out.
 *   - Absolute timeout: 8 h since sign-in regardless of activity -> sign out.
 *
 * Interaction is reported via `reportActivity`, which the root touch handler
 * calls. Backgrounding the app also counts toward idle time; on return we
 * recompute and log out if either threshold was exceeded.
 */

interface SessionContextValue {
  reportActivity: () => void;
  /** Seconds until idle logoff, for optional "session expiring" UI. */
  secondsRemaining: number;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { status, signOut } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    Math.floor(env.sessionIdleTimeoutMs / 1000),
  );

  const isActive = status === 'signedIn';

  const reportActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (isActive) {
      lastActivityRef.current = Date.now();
      sessionStartRef.current = Date.now();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      const now = Date.now();
      const idleFor = now - lastActivityRef.current;
      const sessionFor = now - sessionStartRef.current;

      if (idleFor >= env.sessionIdleTimeoutMs || sessionFor >= env.sessionAbsoluteTimeoutMs) {
        void signOut('timeout');
        return;
      }
      setSecondsRemaining(Math.ceil((env.sessionIdleTimeoutMs - idleFor) / 1000));
    };

    const interval = setInterval(tick, 1000);

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [isActive, signOut]);

  return (
    <SessionContext.Provider value={{ reportActivity, secondsRemaining }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
