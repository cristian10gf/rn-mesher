import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import App from '../../src/App';
import { NativeLiDAR } from '../../src/features/lidar/data/NativeLiDAR';

jest.mock('../../src/features/lidar/data/NativeLiDAR', () => ({
  NativeLiDAR: {
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
  },
}));

jest.mock('../../src/features/lidar/presentation/LiDARView', () => {
  const { View } = require('react-native');
  return { LiDARView: View };
});

describe('scan flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps export disabled while stop is still in progress', async () => {
    const { getByTestId, findByText } = render(<App />);

    expect(getByTestId('export-glb-btn').props.accessibilityState.disabled).toBe(true);

    await act(async () => {
      fireEvent.press(getByTestId('start-btn'));
    });

    await findByText(/Tracking: normal/i);

    let resolveStop: (() => void) | null = null;
    (NativeLiDAR.stopScan as jest.Mock).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveStop = resolve;
        }),
    );

    fireEvent.press(getByTestId('stop-btn'));
    expect(getByTestId('export-glb-btn').props.accessibilityState.disabled).toBe(true);

    await act(async () => {
      resolveStop?.();
    });

    expect(getByTestId('export-glb-btn').props.accessibilityState.disabled).toBe(false);
  });

  it('shows path and format after export', async () => {
    const { getByTestId, findByText } = render(<App />);

    await act(async () => {
      fireEvent.press(getByTestId('start-btn'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('stop-btn'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('export-glb-btn'));
    });

    await findByText(/Ruta:/i);
    await findByText(/Formato: GLB/i);
  });
});
