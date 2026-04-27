import { act, renderHook } from '@testing-library/react-hooks';
import { useLiDARScan } from '../../src/features/lidar/useLiDARScan';

jest.mock('../../src/features/lidar/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
    subscribe: jest.fn((handler: any) => {
      // Immediately simulate exported event for simplicity
      setTimeout(() => handler({ type: 'exported', payload: { plyPath: 'scan.ply', objPath: 'scan.obj' } }), 0);
      return () => undefined;
    }),
  },
}));

describe('useLiDARScan', () => {
  it('moves from idle -> scanning -> exported', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLiDARScan());

    expect(result.current.state.phase).toBe('idle');

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state.phase).toBe('scanning');

    await act(async () => {
      await result.current.stop();
      await result.current.exportMesh();
    });

    // give mocked subscribe a moment to fire
    await new Promise((r) => setTimeout(r, 10));

    expect(result.current.state.phase).toBe('exported');
    expect(result.current.state.output?.plyPath).toContain('scan.ply');
  });
});
