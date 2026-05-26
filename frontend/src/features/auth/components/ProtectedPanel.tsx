import type { ReactNode } from 'react';

import type { UserRole } from '../api/authApi';
import { useAuthState } from '../hooks/authState';

type ProtectedPanelProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  requireActiveSchool?: boolean;
  title: string;
};

export function ProtectedPanel({
  allowedRoles,
  children,
  requireActiveSchool = false,
  title,
}: ProtectedPanelProps) {
  const { currentUser, status } = useAuthState();
  const panelId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (status === 'loading') {
    return (
      <section className="workflow-panel" aria-labelledby={`${panelId}-loading`}>
        <h2 id={`${panelId}-loading`}>{title}</h2>
        <p className="form-result">Loading authenticated session.</p>
      </section>
    );
  }

  if (status === 'unauthenticated' || !currentUser) {
    return (
      <section className="workflow-panel" aria-labelledby={`${panelId}-login-required`}>
        <h2 id={`${panelId}-login-required`}>{title}</h2>
        <p className="form-error">Sign in to access this protected route.</p>
      </section>
    );
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <section className="workflow-panel" aria-labelledby={`${panelId}-forbidden`}>
        <h2 id={`${panelId}-forbidden`}>{title}</h2>
        <p className="form-error">Your role cannot access this route.</p>
      </section>
    );
  }

  if (requireActiveSchool && !currentUser.activeSchool) {
    return (
      <section className="workflow-panel" aria-labelledby={`${panelId}-school-required`}>
        <h2 id={`${panelId}-school-required`}>{title}</h2>
        <p className="form-error">Select an active school to continue.</p>
      </section>
    );
  }

  return <>{children}</>;
}
