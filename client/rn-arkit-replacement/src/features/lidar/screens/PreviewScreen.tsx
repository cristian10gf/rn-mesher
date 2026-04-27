import React from 'react';
import { SafeAreaView, Text } from 'react-native';

export function PreviewScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Preview exported mesh</Text>
    </SafeAreaView>
  );
}
