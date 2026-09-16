import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ScenarioFixtureResponse } from '../midnight/attestationClient';
import type { DrawResultVM } from '../../viewmodels/types';

export interface DrawSessionValue {
  fixture: ScenarioFixtureResponse | null;
  setFixture: (fixture: ScenarioFixtureResponse) => void;
  lastResult: DrawResultVM | null;
  setLastResult: (result: DrawResultVM) => void;
}

const DrawSessionContext = createContext<DrawSessionValue | null>(null);

export interface DrawSessionProviderProps {
  children: ReactNode;
}

export function DrawSessionProvider({ children }: DrawSessionProviderProps) {
  const [fixture, setFixtureState] = useState<ScenarioFixtureResponse | null>(null);
  const [lastResult, setLastResultState] = useState<DrawResultVM | null>(null);

  const setFixture = useCallback((next: ScenarioFixtureResponse) => {
    setFixtureState(next);
  }, []);

  const setLastResult = useCallback((next: DrawResultVM) => {
    setLastResultState(next);
  }, []);

  const value = useMemo<DrawSessionValue>(
    () => ({ fixture, setFixture, lastResult, setLastResult }),
    [fixture, setFixture, lastResult, setLastResult],
  );

  return <DrawSessionContext.Provider value={value}>{children}</DrawSessionContext.Provider>;
}

export function useDrawSession(): DrawSessionValue {
  const value = useContext(DrawSessionContext);
  if (value === null) {
    throw new Error('useDrawSession must be used within a DrawSessionProvider');
  }
  return value;
}
