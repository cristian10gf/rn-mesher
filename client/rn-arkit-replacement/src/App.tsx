import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { ScanScreen } from './features/lidar/screens/ScanScreen';
import { PreviewScreen } from './features/lidar/screens/PreviewScreen';

export default function App() {
  const [preview, setPreview] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {preview ? <PreviewScreen /> : <ScanScreen onExported={() => setPreview(true)} />}
    </SafeAreaView>
  );
}
