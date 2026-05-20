import React, { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import { ARKitMeshScanner } from 'react-native-arkit-mesh-scanner';
import type { MeshStats, ARKitMeshScannerRef } from 'react-native-arkit-mesh-scanner';

export const LiDARView = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const ref = useRef<ARKitMeshScannerRef>(null);

  useEffect(() => {
    if (ref.current) {
      DeviceEventEmitter.emit('LiDARScannerRefSet', ref.current);
    }
    return () => {
      DeviceEventEmitter.emit('LiDARScannerRefSet', null);
    };
  }, []);

  const handleMeshUpdate = (stats: MeshStats) => {
    // Optional: map to tracking changes if we wanted.
  };

  const handleError = (error: string) => {
    DeviceEventEmitter.emit('onLiDAREvent', {
      type: 'error',
      payload: { code: 'mesh_generation_failed', message: error }
    });
  };

  return (
    <ARKitMeshScanner
      ref={ref}
      style={style as ViewStyle}
      showMesh={true}
      meshColor="#00FFFF"
      wireframe={false}
      enableOcclusion={true}
      onMeshUpdate={handleMeshUpdate}
      onError={handleError}
    />
  );
};
