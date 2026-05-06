import { NativeEventEmitter, NativeModules } from 'react-native';
import type { LiDAREvent } from '../domain/LiDARRepository';
import type { MeshOutput, ScanConfig } from '../domain/types';

type NativeLiDARShape = {
  startScan: (config: ScanConfig) => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput>;
};

const moduleRef = (NativeModules.RNLiDARBridgeModule ?? {}) as Partial<NativeLiDARShape>;
const eventSource = NativeModules.RNLiDAREventEmitter ?? NativeModules.RNLiDARBridgeModule ?? null;
const hasNativeEmitter =
  !!eventSource &&
  typeof (eventSource as { addListener?: unknown }).addListener === 'function' &&
  typeof (eventSource as { removeListeners?: unknown }).removeListeners === 'function';
const emitter = hasNativeEmitter ? new NativeEventEmitter(eventSource as any) : null;

function missingModuleError(method: string): Error {
  return new Error(`RNLiDARBridgeModule.${method} unavailable (native module not linked or unsupported device).`);
}

export const NativeLiDAR = {
  startScan: (config: ScanConfig) =>
    moduleRef.startScan ? moduleRef.startScan(config) : Promise.reject(missingModuleError('startScan')),
  stopScan: () =>
    moduleRef.stopScan ? moduleRef.stopScan() : Promise.reject(missingModuleError('stopScan')),
  exportMesh: () =>
    moduleRef.exportMesh
      ? moduleRef.exportMesh()
      : Promise.reject(missingModuleError('exportMesh')),
  subscribe: (handler: (event: LiDAREvent) => void) => {
    if (!emitter || typeof emitter.addListener !== 'function') return () => undefined;
    const sub = emitter.addListener('onMeshUpdate', handler as any);
    return () => sub.remove();
  },
};
