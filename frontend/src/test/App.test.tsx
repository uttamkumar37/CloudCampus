import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '@/app/App';

describe('App smoke test', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
