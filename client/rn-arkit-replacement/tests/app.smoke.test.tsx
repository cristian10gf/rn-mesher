import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../src/App';

describe('App shell', () => {
  it('renders isolated LiDAR scanner title', () => {
    const { getByText } = render(<App />);
    expect(getByText('UniWhere LiDAR Scanner')).toBeTruthy();
  });
});
