export type ScanPhase =
  | 'idle'
  | 'initializing'
  | 'scanning'
  | 'stopping'
  | 'stopped'
  | 'exporting'
  | 'exported'
  | 'error';

export type TrackingQuality = 'normal' | 'limited' | 'unavailable';

export type ScanErrorCode =
  | 'lidar_not_supported'
  | 'camera_permission_denied'
  | 'tracking_degraded'
  | 'mesh_generation_failed'
  | 'export_failed';

export interface MeshOutput {
  path: string;
  format: 'ply' | 'glb' | 'gltf';
  vertexCount: number;
  faceCount: number;
  timestamp: string;
}

export interface ScanState {
  phase: ScanPhase;
  trackingQuality: TrackingQuality;
  output?: MeshOutput;
  errorCode?: ScanErrorCode;
  error?: string;
}

export interface ScanConfig {
  qualityPreset: 'balanced' | 'quality' | 'performance';
  environmentMode: 'auto';
}
