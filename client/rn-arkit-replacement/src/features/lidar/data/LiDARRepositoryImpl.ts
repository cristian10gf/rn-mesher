import type { LiDAREvent, LiDARRepository } from '../domain/LiDARRepository';
import type { ScanConfig } from '../domain/types';
import { NativeLiDAR } from './NativeLiDAR';

export class LiDARRepositoryImpl implements LiDARRepository {
  startScan(config: ScanConfig) {
    return NativeLiDAR.startScan(config);
  }

  stopScan() {
    return NativeLiDAR.stopScan();
  }

  exportMesh() {
    return NativeLiDAR.exportMesh();
  }

  subscribe(handler: (event: LiDAREvent) => void) {
    return NativeLiDAR.subscribe(handler);
  }
}
