import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../../../../theme';
import { useLiDARScan } from '../useLiDARScan';
import { LiDARView } from '../LiDARView';
import { scanPhaseLabel } from '../scanPhaseLabel';
import type { MeshOutput } from '../../domain/types';

export function ScanScreen({ onExported }: { onExported: (output: MeshOutput) => void }) {
  const scan = useLiDARScan();
  const insets = useSafeAreaInsets();
  const phase = scan.state.phase;
  const isError = phase === 'error';
  const canStop = phase === 'scanning';
  const canExport = phase === 'stopped';

  const handleExport = async () => {
    const out = await scan.exportMesh();
    if (out) {
      onExported(out);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <View style={[styles.header, { paddingTop: Math.max(space.md, insets.top) }]}>
        <Text style={[type.overline, styles.tag]}>LiDAR</Text>
        <Text style={[type.headline, styles.title]}>UniWhere Scanner</Text>
        <Text style={[type.body, styles.subtitle]}>
          Estado: {scanPhaseLabel(phase)} | Tracking: {scan.state.trackingQuality}
        </Text>
      </View>

      <View style={styles.viewerWrap}>
        <View style={styles.viewerCard}>
          <View style={styles.viewerInner}>
            <LiDARView style={styles.lidarView} />
          </View>
          <View style={styles.viewerFooter}>
            <View style={styles.liveDot} />
            <Text style={[type.caption, styles.viewerHint]}>Vista en vivo</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(space.lg, insets.bottom + space.sm) }]}>
        <View style={[styles.phasePill, isError && styles.phasePillError]}>
          <Text style={[type.body, styles.phaseLine]}>
            Estado: <Text style={[type.title, styles.phaseValue]}>{scanPhaseLabel(phase)}</Text>
          </Text>
          {scan.state.error ? (
            <Text style={[type.caption, styles.phaseError]} numberOfLines={2}>
              {scan.state.error}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <ActionButton
            testID="start-btn"
            label="Iniciar"
            variant="primary"
            onPress={scan.start}
            disabled={phase !== 'idle' && phase !== 'error' && phase !== 'exported'}
          />
          <ActionButton
            testID="stop-btn"
            label="Detener"
            variant="muted"
            onPress={scan.stop}
            disabled={!canStop}
          />
          <ActionButton
            testID="export-btn"
            label="Exportar"
            variant="accent"
            onPress={handleExport}
            disabled={!canExport}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ActionButton({
  testID,
  label,
  variant,
  onPress,
  disabled,
}: {
  testID?: string;
  label: string;
  variant: 'primary' | 'muted' | 'accent';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'muted' && styles.btnMuted,
        variant === 'accent' && styles.btnAccent,
        disabled && styles.btnDisabled,
        pressed && styles.btnPressed,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
    >
      <Text
        style={[
          type.button,
          variant === 'primary' && styles.btnTextInverse,
          variant === 'accent' && styles.btnTextAccent,
          variant === 'muted' && styles.btnText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  tag: { color: colors.accent, marginBottom: space.xs },
  title: { color: colors.textPrimary },
  subtitle: { color: colors.textMuted, marginTop: space.xs },
  viewerWrap: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  viewerCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  viewerInner: {
    flex: 1,
    backgroundColor: colors.viewerInner,
    margin: space.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  lidarView: { flex: 1 },
  viewerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    backgroundColor: colors.surfaceElevated,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  viewerHint: { color: colors.textMuted },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  phasePill: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phasePillError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  phaseLine: { color: colors.textMuted },
  phaseValue: { color: colors.textPrimary },
  phaseError: { color: colors.danger, marginTop: space.sm },
  actions: { flexDirection: 'row', gap: space.sm },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    borderRadius: radius.md,
    minHeight: 48,
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnMuted: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  btnAccent: { backgroundColor: colors.accentMuted, borderWidth: 1, borderColor: colors.accent },
  btnDisabled: { opacity: 0.45 },
  btnPressed: { opacity: 0.88 },
  btnText: { color: colors.textPrimary, textAlign: 'center' },
  btnTextInverse: { color: colors.bg, textAlign: 'center' },
  btnTextAccent: { color: colors.accent, textAlign: 'center' },
});
