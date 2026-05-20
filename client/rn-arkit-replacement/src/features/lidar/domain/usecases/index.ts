import type { LiDARRepository } from '../LiDARRepository';
import type { MeshOutput, ScanConfig } from '../types';

const defaultScanConfig: ScanConfig = {
  qualityPreset: 'balanced',
  environmentMode: 'auto',
};

export type LiDARUseCases = {
  start: (config?: ScanConfig) => Promise<void>;
  stop: () => Promise<void>;
  exportMesh: (format?: 'ply' | 'glb' | 'gltf') => Promise<MeshOutput>;
};

export function createLiDARUseCases(repo: LiDARRepository): LiDARUseCases {
  return {
    start: (config?: ScanConfig) => repo.startScan(config ?? defaultScanConfig),
    stop: () => repo.stopScan(),
    exportMesh: (format?: 'ply' | 'glb' | 'gltf') => repo.exportMesh(format ?? 'glb'),
  };
}
