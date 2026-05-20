import { DeviceEventEmitter } from 'react-native';
import type { LiDAREvent } from '../domain/LiDARRepository';
import type { MeshOutput, ScanConfig } from '../domain/types';
import type { ARKitMeshScannerRef } from 'react-native-arkit-mesh-scanner';

let globalScannerRef: ARKitMeshScannerRef | null = null;

DeviceEventEmitter.addListener('LiDARScannerRefSet', (ref: ARKitMeshScannerRef | null) => {
  globalScannerRef = ref;
});

function missingModuleError(method: string): Error {
  return new Error(`Scanner reference missing for method ${method}. Make sure you are rendering the LiDARView component.`);
}

export const NativeLiDAR = {
  startScan: async (config: ScanConfig) => {
    if (!globalScannerRef) return Promise.reject(missingModuleError('startScanning'));
    globalScannerRef.startScanning();
    DeviceEventEmitter.emit('onLiDAREvent', { type: 'scan_started' });
  },
  stopScan: async () => {
    if (!globalScannerRef) return Promise.reject(missingModuleError('stopScanning'));
    globalScannerRef.stopScanning();
    DeviceEventEmitter.emit('onLiDAREvent', { type: 'scan_stopped' });
  },
  exportMesh: async (format: 'ply' | 'glb' | 'gltf' = 'glb') => {
    if (!globalScannerRef) return Promise.reject(missingModuleError('exportMesh'));
    
    const filename = `scan-${Date.now()}.${format}`;
    const result = await globalScannerRef.exportMesh(filename);
    
    const out: MeshOutput = {
      path: result.path,
      format: format,
      vertexCount: result.vertexCount,
      faceCount: result.faceCount,
      timestamp: new Date().toISOString()
    };
    
    DeviceEventEmitter.emit('onLiDAREvent', { type: 'export_completed', payload: out });
    return out;
  },
  subscribe: (handler: (event: LiDAREvent) => void) => {
    const sub = DeviceEventEmitter.addListener('onLiDAREvent', handler);
    return () => sub.remove();
  },
  emitEvent: (event: LiDAREvent) => {
    DeviceEventEmitter.emit('onLiDAREvent', event);
  }
};
