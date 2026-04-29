import type { MeshOutput } from './types';

export type LiDAREvent =
  | { type: 'exported'; payload: MeshOutput }
  | { type: 'error'; error: string };

export type Unsubscribe = () => void;

export interface LiDARRepository {
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput>;
  uploadMeshArtifacts: (output: MeshOutput) => Promise<void>;
  subscribe: (handler: (event: LiDAREvent) => void) => Unsubscribe;
}
