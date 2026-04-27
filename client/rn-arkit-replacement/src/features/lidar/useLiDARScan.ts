import { useEffect, useMemo, useState } from 'react';
import { NativeLiDAR } from './NativeLiDAR';
import type { ScanState, MeshOutput } from './types';

type UseLiDARApi = {
  state: ScanState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput | undefined>;
};

export function useLiDARScan(): UseLiDARApi {
  const [state, setState] = useState<ScanState>({ phase: 'idle' });

  useEffect(() => {
    const unsub = NativeLiDAR.subscribe((event: any) => {
      if (!event) return;
      if (event.type === 'exported' && event.payload) {
        setState({ phase: 'exported', output: event.payload });
      }
      if (event.type === 'error' && event.error) {
        setState({ phase: 'error', error: String(event.error) });
      }
    });
    return unsub;
  }, []);

  const api = useMemo<UseLiDARApi>(() => ({
    state,
    start: async () => {
      setState({ phase: 'scanning' });
      try {
        await NativeLiDAR.startScan();
      } catch (err: any) {
        setState({ phase: 'error', error: String(err) });
      }
    },
    stop: async () => {
      setState({ phase: 'exporting' });
      try {
        await NativeLiDAR.stopScan();
      } catch (err: any) {
        setState({ phase: 'error', error: String(err) });
      }
    },
    exportMesh: async () => {
      try {
        const out = await NativeLiDAR.exportMesh();
        setState({ phase: 'exported', output: out });
        return out;
      } catch (err: any) {
        setState({ phase: 'error', error: String(err) });
        return undefined;
      }
    },
  }), [state]);

  return api;
}
