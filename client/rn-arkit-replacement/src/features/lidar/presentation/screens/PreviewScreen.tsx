import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../../../../theme';
import type { MeshOutput } from '../../domain/types';

type Props = {
  output: MeshOutput;
  onScanAgain?: () => void;
};

export function PreviewScreen({ output, onScanAgain }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <View style={[styles.inner, { paddingTop: Math.max(space.xxl, insets.top), paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconGlyph}>✓</Text>
        </View>
        <Text style={[type.overline, styles.overline]}>Exportación</Text>
        <Text style={[type.headline, styles.title]}>Exportación completada</Text>
        <Text style={[type.body, styles.body]}>Ruta: {output.path}</Text>
        <Text style={[type.body, styles.body]}>Formato: {output.format.toUpperCase()}</Text>
        <Text style={[type.caption, styles.meta]}>
          Vértices: {output.vertexCount} | Caras: {output.faceCount}
        </Text>
        <Text style={[type.caption, styles.meta]}>Fecha: {output.timestamp}</Text>
        {onScanAgain ? (
          <Pressable
            testID="scan-again-btn"
            onPress={onScanAgain}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
          >
            <Text style={[type.button, styles.ctaText]}>Escanear de nuevo</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  inner: {
    flex: 1,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  iconGlyph: { fontSize: 32, color: colors.accent, fontWeight: '700' },
  overline: { color: colors.accent, marginBottom: space.sm, textAlign: 'center' },
  title: { color: colors.textPrimary, textAlign: 'center', marginBottom: space.md },
  body: { color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
  meta: { color: colors.textMuted, textAlign: 'center' },
  cta: {
    marginTop: space.xxl,
    backgroundColor: colors.accent,
    paddingVertical: space.md,
    paddingHorizontal: space.xxl,
    borderRadius: radius.md,
    minWidth: 220,
    alignItems: 'center',
  },
  ctaPressed: { opacity: 0.9 },
  ctaText: { color: colors.bg },
});
