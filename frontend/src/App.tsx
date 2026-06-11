import { AuthProvider } from "./features/auth/AuthProvider";
import { AppShell } from "./components/AppShell";

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
