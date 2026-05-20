import { useEffect, useMemo, useState } from 'react';
import { useDI } from '../../../core/di/useDI';
import type { LiDARRepository } from '../domain/LiDARRepository';
import { createLiDARUseCases } from '../domain/usecases';
import type { MeshOutput, ScanErrorCode, ScanState } from '../domain/types';

type UseLiDARApi = {
  state: ScanState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  exportMesh: (format?: 'ply' | 'glb' | 'gltf') => Promise<MeshOutput | undefined>;
};

const initialState: ScanState = {
  phase: 'idle',
  trackingQuality: 'normal',
};

function toScanErrorCode(code: string | undefined): ScanErrorCode {
  switch (code) {
    case 'lidar_not_supported':
    case 'camera_permission_denied':
    case 'tracking_degraded':
    case 'mesh_generation_failed':
    case 'export_failed':
      return code;
    default:
      return 'mesh_generation_failed';
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

export function useLiDARScan(repoOverride?: LiDARRepository): UseLiDARApi {
  const { lidarRepository } = useDI();
  const repo = repoOverride ?? lidarRepository;
  const useCases = useMemo(() => createLiDARUseCases(repo), [repo]);
  const [state, setState] = useState<ScanState>(initialState);

  useEffect(() => {
    const unsub = repo.subscribe((event) => {
      if (!event) return;
      if (event.type === 'tracking_changed') {
        setState((prev) => ({
          ...prev,
          trackingQuality: event.payload.trackingQuality,
        }));
      } else if (event.type === 'scan_started') {
        setState((prev) => ({ ...prev, phase: 'scanning' }));
      } else if (event.type === 'scan_stopped') {
        setState((prev) => ({ ...prev, phase: 'stopped' }));
      } else if (event.type === 'export_completed') {
        setState((prev) => ({ ...prev, phase: 'exported', output: event.payload }));
      } else if (event.type === 'error') {
        setState((prev) => ({
          ...prev,
          phase: 'error',
          errorCode: toScanErrorCode(event.payload.code),
          error: event.payload.message,
        }));
      }
    });
    return unsub;
  }, [repo]);

  const api = useMemo<UseLiDARApi>(
    () => ({
      state,
      start: async () => {
        setState((prev) => ({ ...prev, phase: 'initializing', error: undefined, errorCode: undefined }));
        try {
          await useCases.start();
          setState((prev) => ({ ...prev, phase: 'scanning' }));
        } catch (err: any) {
          setState((prev) => ({
            ...prev,
            phase: 'error',
            errorCode: 'mesh_generation_failed',
            error: toErrorMessage(err),
          }));
        }
      },
      stop: async () => {
        setState((prev) => ({ ...prev, phase: 'stopping' }));
        try {
          await useCases.stop();
          setState((prev) => ({ ...prev, phase: 'stopped' }));
        } catch (err: any) {
          setState((prev) => ({
            ...prev,
            phase: 'error',
            errorCode: 'mesh_generation_failed',
            error: toErrorMessage(err),
          }));
        }
      },
      exportMesh: async (format?: 'ply' | 'glb' | 'gltf') => {
        setState((prev) => ({ ...prev, phase: 'exporting' }));
        try {
          const out = await useCases.exportMesh(format);
          setState((prev) => ({ ...prev, phase: 'exported', output: out }));
          return out;
        } catch (err: any) {
          setState((prev) => ({
            ...prev,
            phase: 'error',
            errorCode: 'export_failed',
            error: toErrorMessage(err),
          }));
          return undefined;
        }
      },
    }),
    [state, useCases],
  );

  return api;
}
