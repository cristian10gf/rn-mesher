import React, { createContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { DIContainer } from './tokens';
import { createContainer } from './container';

export const DIContext = createContext<DIContainer | null>(null);

type DIProviderProps = PropsWithChildren<{
  container?: DIContainer;
}>;

export function DIProvider({ children, container }: DIProviderProps) {
  const value = useMemo(() => container ?? createContainer(), [container]);
  return <DIContext.Provider value={value}>{children}</DIContext.Provider>;
}
