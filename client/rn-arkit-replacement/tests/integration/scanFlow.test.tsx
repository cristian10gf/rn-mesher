import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import App from '../../src/App';

jest.mock('../../src/features/lidar/NativeLiDAR', () => ({
  NativeLiDAR: {
    startScan: jest.fn().mockResolvedValue(undefined),
    stopScan: jest.fn().mockResolvedValue(undefined),
    exportMesh: jest.fn().mockResolvedValue({ plyPath: 'scan.ply', objPath: 'scan.obj' }),
    subscribe: jest.fn((handler: any) => {
      // simulate exported event when exportMesh is called
      return () => undefined;
    }),
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    requireNativeComponent: () => 'RNLiDARView',
  };
});

describe('scan flow', () => {
  it('starts scan and navigates to preview after export', async () => {
    const { getByTestId, getByText } = render(<App />);

    const start = getByTestId('start-btn');
    const stop = getByTestId('stop-btn');
    const exp = getByTestId('export-btn');

    fireEvent.press(start);
    await waitFor(() => expect(getByText(/Estado:/)).toBeTruthy());

    fireEvent.press(stop);
    fireEvent.press(exp);

    // after export, PreviewScreen should be visible
    await waitFor(() => expect(getByText('Preview exported mesh')).toBeTruthy());
  });
});
