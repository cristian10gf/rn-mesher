import type { LiDARRepository } from '../domain/LiDARRepository';
import type { MeshOutput } from '../domain/types';
import { NativeLiDAR } from './NativeLiDAR';
import { uploadMeshArtifacts } from './MeshUploadService';

export class LiDARRepositoryImpl implements LiDARRepository {
  startScan() {
    return NativeLiDAR.startScan();
  }

  stopScan() {
    return NativeLiDAR.stopScan();
  }

  exportMesh() {
    return NativeLiDAR.exportMesh();
  }

  uploadMeshArtifacts(output: MeshOutput) {
    return uploadMeshArtifacts(output);
  }

  subscribe(handler: (event: any) => void) {
    return NativeLiDAR.subscribe(handler);
  }
}
