import { render, screen } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
  it('renders the CloudCampus onboarding baseline shell', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', {
        name: /clean single-school onboarding/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cloudcampus-shell')).toBeInTheDocument();
    expect(screen.getByText(/backend api shell/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /create tenant with first real school/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /accept school admin invitation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /school admin login/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /link parent to student/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /provision staff portal login/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /academic setup/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /academic assignments/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /student import/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bulk jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fee lifecycle/i })).toBeInTheDocument();
  });
});
