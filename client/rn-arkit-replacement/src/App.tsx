import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DIProvider } from './core/di/DIProvider';
import { ScanScreen } from './features/lidar/presentation/screens/ScanScreen';
import { PreviewScreen } from './features/lidar/presentation/screens/PreviewScreen';
import { colors } from './theme';

export default function App() {
  const [preview, setPreview] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <DIProvider>
        <View style={styles.shell}>
          {preview ? (
            <PreviewScreen onScanAgain={() => setPreview(false)} />
          ) : (
            <ScanScreen onExported={() => setPreview(true)} />
          )}
        </View>
      </DIProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
});
