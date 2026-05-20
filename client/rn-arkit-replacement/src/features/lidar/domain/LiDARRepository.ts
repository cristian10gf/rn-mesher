import type { MeshOutput, ScanConfig, ScanErrorCode, TrackingQuality } from './types';

export type LiDAREvent =
  | { type: 'scan_started' }
  | { type: 'scan_stopped' }
  | { type: 'tracking_changed'; payload: { trackingQuality: TrackingQuality } }
  | { type: 'export_completed'; payload: MeshOutput }
  | { type: 'error'; payload: { code: ScanErrorCode; message: string } };

export type Unsubscribe = () => void;

export interface LiDARRepository {
  startScan: (config: ScanConfig) => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: (format?: 'ply' | 'glb' | 'gltf') => Promise<MeshOutput>;
  subscribe: (handler: (event: LiDAREvent) => void) => Unsubscribe;
}
