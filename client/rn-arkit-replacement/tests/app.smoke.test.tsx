import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../src/App';

describe('App shell', () => {
  it('renders scanner headline', () => {
    const { getByText } = render(<App />);
    expect(getByText(/UniWhere Scanner/)).toBeTruthy();
  });
});
