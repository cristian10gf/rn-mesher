import React from 'react';
import { Button, SafeAreaView, Text, View } from 'react-native';
import { useLiDARScan } from '../useLiDARScan';
import { LiDARView } from '../LiDARView';
import { uploadMeshArtifacts } from '../../../services/mesh/MeshUploadService';

export function ScanScreen({ onExported }: { onExported: () => void }) {
  const scan = useLiDARScan();

  const handleExport = async () => {
    const out = await scan.exportMesh();
    if (out) {
      await uploadMeshArtifacts(out);
      onExported();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <LiDARView style={{ flex: 1 }} />
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ marginBottom: 8 }}>Estado: {scan.state.phase}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button testID="start-btn" title="Start" onPress={() => scan.start()} />
          <Button testID="stop-btn" title="Stop" onPress={() => scan.stop()} />
          <Button testID="export-btn" title="Export" onPress={handleExport} />
        </View>
      </View>
    </SafeAreaView>
  );
}
