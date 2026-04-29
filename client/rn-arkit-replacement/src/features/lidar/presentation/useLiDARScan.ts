import { useEffect, useMemo, useState } from 'react';
import { useDI } from '../../../core/di/useDI';
import type { LiDARRepository } from '../domain/LiDARRepository';
import type { MeshOutput, ScanState } from '../domain/types';

type UseLiDARApi = {
  state: ScanState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput | undefined>;
  upload: (output: MeshOutput) => Promise<void>;
};

export function useLiDARScan(repoOverride?: LiDARRepository): UseLiDARApi {
  const { lidarRepository } = useDI();
  const repo = repoOverride ?? lidarRepository;
  const [state, setState] = useState<ScanState>({ phase: 'idle' });

  useEffect(() => {
    const unsub = repo.subscribe((event: any) => {
      if (!event) return;
      if (event.type === 'exported' && event.payload) {
        setState({ phase: 'exported', output: event.payload });
      }
      if (event.type === 'error' && event.error) {
        setState({ phase: 'error', error: String(event.error) });
      }
    });
    return unsub;
  }, [repo]);

  const api = useMemo<UseLiDARApi>(
    () => ({
      state,
      start: async () => {
        setState({ phase: 'scanning' });
        try {
          await repo.startScan();
        } catch (err: any) {
          setState({ phase: 'error', error: String(err) });
        }
      },
      stop: async () => {
        setState({ phase: 'exporting' });
        try {
          await repo.stopScan();
        } catch (err: any) {
          setState({ phase: 'error', error: String(err) });
        }
      },
      exportMesh: async () => {
        try {
          const out = await repo.exportMesh();
          setState({ phase: 'exported', output: out });
          return out;
        } catch (err: any) {
          setState({ phase: 'error', error: String(err) });
          return undefined;
        }
      },
      upload: async (output: MeshOutput) => {
        await repo.uploadMeshArtifacts(output);
      },
    }),
    [repo, state],
  );

  return api;
}
