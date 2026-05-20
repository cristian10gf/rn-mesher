import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useLiDARScan } from '../../src/features/lidar/presentation/useLiDARScan';
import type { LiDAREvent, LiDARRepository } from '../../src/features/lidar/domain/LiDARRepository';
import { DIProvider } from '../../src/core/di/DIProvider';
import type { DIContainer } from '../../src/core/di/tokens';

const createRepo = (): LiDARRepository => ({
  startScan: jest.fn().mockResolvedValue(undefined),
  stopScan: jest.fn().mockResolvedValue(undefined),
  exportMesh: jest.fn().mockResolvedValue({
    path: '/tmp/scan.glb',
    format: 'glb',
    vertexCount: 1200,
    faceCount: 800,
    timestamp: '2026-05-05T18:00:00.000Z',
  }),
  subscribe: jest.fn(() => () => undefined),
});

describe('useLiDARScan', () => {
  it('tracks initializing -> scanning -> stopping -> stopped -> exporting -> exported', async () => {
    const repo = createRepo();
    const container: DIContainer = { lidarRepository: repo };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>{children}</DIProvider>
    );
    const { result } = renderHook(() => useLiDARScan(), { wrapper });

    expect(result.current.state.phase).toBe('idle');

    await act(async () => {
      await result.current.start();
    });

    expect(repo.startScan).toHaveBeenCalledWith({
      qualityPreset: 'balanced',
      environmentMode: 'auto',
    });
    expect(result.current.state.phase).toBe('scanning');

    await act(async () => {
      await result.current.stop();
    });
    expect(result.current.state.phase).toBe('stopped');

    await act(async () => {
      await result.current.exportMesh();
    });

    expect(repo.exportMesh).toHaveBeenCalled();
    expect(result.current.state.phase).toBe('exported');
    expect(result.current.state.output?.path).toContain('scan.glb');
    expect(result.current.state.output?.format).toBe('glb');
    expect(result.current.state.output?.vertexCount).toBeGreaterThan(0);
    expect(result.current.state.output?.faceCount).toBeGreaterThan(0);
    expect(result.current.state.output?.timestamp).toBe('2026-05-05T18:00:00.000Z');
  });

  it('maps tracking_changed event to trackingQuality', async () => {
    const subscribeHandlers: Array<(event: LiDAREvent) => void> = [];
    const repo: LiDARRepository = {
      startScan: jest.fn().mockResolvedValue(undefined),
      stopScan: jest.fn().mockResolvedValue(undefined),
      exportMesh: jest.fn().mockResolvedValue({
        path: '/tmp/scan.glb',
        format: 'glb',
        vertexCount: 1,
        faceCount: 1,
        timestamp: '2026-05-05T18:00:00.000Z',
      }),
      subscribe: jest.fn((handler) => {
        subscribeHandlers.push(handler);
        return () => undefined;
      }),
    };
    const container: DIContainer = { lidarRepository: repo };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DIProvider container={container}>{children}</DIProvider>
    );
    const { result } = renderHook(() => useLiDARScan(), { wrapper });

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      subscribeHandlers[0]?.({
        type: 'tracking_changed',
        payload: { trackingQuality: 'limited' },
      });
    });

    expect(result.current.state.trackingQuality).toBe('limited');
  });
});
