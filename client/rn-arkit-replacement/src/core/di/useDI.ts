import { useContext } from 'react';
import { DIContext } from './DIProvider';

export function useDI() {
  const ctx = useContext(DIContext);
  if (!ctx) throw new Error('DIProvider is missing');
  return ctx;
}
