import { NativeEventEmitter, NativeModules } from 'react-native';
import type { MeshOutput } from '../domain/types';

type NativeLiDARShape = {
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
  exportMesh: () => Promise<MeshOutput>;
};

const moduleRef = (NativeModules.RNLiDARBridgeModule ?? {}) as Partial<NativeLiDARShape>;
const emitter = new NativeEventEmitter((NativeModules.RNLiDAREventEmitter ?? moduleRef) as any);

export const NativeLiDAR = {
  startScan: () => (moduleRef.startScan ? moduleRef.startScan() : Promise.resolve()),
  stopScan: () => (moduleRef.stopScan ? moduleRef.stopScan() : Promise.resolve()),
  exportMesh: () =>
    moduleRef.exportMesh ? moduleRef.exportMesh() : Promise.resolve({ plyPath: '', objPath: '' }),
  subscribe: (handler: (event: unknown) => void) => {
    if (!emitter || typeof emitter.addListener !== 'function') return () => undefined;
    const sub = emitter.addListener('onMeshUpdate', handler as any);
    return () => sub.remove();
  },
};
