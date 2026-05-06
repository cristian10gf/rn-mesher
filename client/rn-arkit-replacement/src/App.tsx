import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DIProvider } from './core/di/DIProvider';
import { ScanScreen } from './features/lidar/presentation/screens/ScanScreen';
import { PreviewScreen } from './features/lidar/presentation/screens/PreviewScreen';
import type { MeshOutput } from './features/lidar/domain/types';
import { colors } from './theme';

export default function App() {
  const [output, setOutput] = useState<MeshOutput | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <DIProvider>
        <View style={styles.shell}>
          {output ? (
            <PreviewScreen output={output} onScanAgain={() => setOutput(null)} />
          ) : (
            <ScanScreen onExported={setOutput} />
          )}
        </View>
      </DIProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
});
