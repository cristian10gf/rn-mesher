import type { LiDARRepository } from '../LiDARRepository';
import type { MeshOutput, ScanConfig } from '../types';

const defaultScanConfig: ScanConfig = {
  qualityPreset: 'balanced',
  environmentMode: 'auto',
};

export type LiDARUseCases = {
  start: (config?: ScanConfig) => Promise<void>;
  stop: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput>;
};

export function createLiDARUseCases(repo: LiDARRepository): LiDARUseCases {
  return {
    start: (config?: ScanConfig) => repo.startScan(config ?? defaultScanConfig),
    stop: () => repo.stopScan(),
    exportMesh: () => repo.exportMesh(),
  };
}
