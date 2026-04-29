import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useLiDARScan } from '../../src/features/lidar/presentation/useLiDARScan';
import type { LiDARRepository } from '../../src/features/lidar/domain/LiDARRepository';
import { DIProvider } from '../../src/core/di/DIProvider';
import type { DIContainer } from '../../src/core/di/tokens';

const createRepo = (): LiDARRepository => ({
  startScan: jest.fn().mockResolvedValue(undefined),
  stopScan: jest.fn().mockResolvedValue(undefined),
  exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
  uploadMeshArtifacts: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(() => () => undefined),
});

describe('useLiDARScan', () => {
  it('moves from idle -> scanning -> exported', async () => {
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

    expect(repo.startScan).toHaveBeenCalled();
    expect(result.current.state.phase).toBe('scanning');

    await act(async () => {
      await result.current.stop();
      await result.current.exportMesh();
    });

    expect(repo.exportMesh).toHaveBeenCalled();
    expect(result.current.state.phase).toBe('exported');
    expect(result.current.state.output?.plyPath).toContain('scan.ply');
  });
});
