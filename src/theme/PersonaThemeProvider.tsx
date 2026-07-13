import React, { useMemo } from 'react';

import { useAuth } from '@/store/AuthContext';
import { PROVIDER_ROLES, UserRole } from '@/types/roles';
import { colorsForPersona, Persona } from './personas';
import { ThemeContext, ThemeContextValue, useThemeBase } from './ThemeProvider';

function resolvePersona(status: string, role: UserRole | undefined): Persona | null {
  if (status !== 'signedIn' || !role) return null;
  return PROVIDER_ROLES.includes(role) ? 'provider' : 'patient';
}

/** Applies patient vs provider color palettes after sign-in. */
export function PersonaThemeProvider({ children }: { children: React.ReactNode }) {
  const base = useThemeBase();
  const { status, user } = useAuth();

  const persona = useMemo(
    () => resolvePersona(status, user?.role),
    [status, user?.role],
  );

  const value = useMemo<ThemeContextValue>(() => {
    if (!persona || base.mode === 'highContrast') {
      return { ...base, persona: null };
    }
    return {
      ...base,
      persona,
      colors: colorsForPersona(persona, base.isDark),
    };
  }, [base, persona]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
