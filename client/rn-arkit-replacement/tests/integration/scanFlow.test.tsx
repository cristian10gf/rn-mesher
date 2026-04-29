import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import App from '../../src/App';

jest.mock('../../src/features/lidar/data/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
    subscribe: jest.fn(() => () => undefined),
  },
}));

jest.mock('../../src/features/lidar/presentation/LiDARView', () => {
  const { View } = require('react-native');
  return { LiDARView: View };
});

describe('scan flow', () => {
  it(
    'starts scan and navigates to preview after export',
    async () => {
      const { getByTestId, findByText } = render(<App />);

      await act(async () => {
        fireEvent.press(getByTestId('start-btn'));
      });
      await findByText(/Estado: Escaneando/);

      await act(async () => {
        fireEvent.press(getByTestId('stop-btn'));
        fireEvent.press(getByTestId('export-btn'));
      });

      await findByText('Preview exported mesh');
    },
    15000,
  );
});
