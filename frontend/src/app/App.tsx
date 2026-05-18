import { ErrorBoundary } from './ErrorBoundary';
import { Providers } from './providers';
import { AppRouter } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  );
}
