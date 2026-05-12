import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForbiddenPage } from '@/features/auth/pages/ForbiddenPage';
import { PlanUpgradePage } from '@/features/auth/pages/PlanUpgradePage';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { TenantListPage } from '@/features/super-admin/pages/TenantListPage';
import { TenantCreatePage } from '@/features/super-admin/pages/TenantCreatePage';
import { SchoolAdminLayout } from '@/features/school-admin/layouts/SchoolAdminLayout';
import { SchoolAdminDashboardPage } from '@/features/school-admin/pages/SchoolAdminDashboardPage';

/**
 * Application router.
 *
 * Public:        /login, /403, /plan-upgrade
 * Super Admin:   /super-admin/tenants, /super-admin/tenants/new
 * School Admin:  /school-admin/* — SCHOOL_ADMIN role required
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/plan-upgrade" element={<PlanUpgradePage />} />

        {/* Super Admin portal — SUPER_ADMIN role required */}
        <Route
          path="/super-admin/tenants/new"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <TenantCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/tenants"
          element={
            <ProtectedRoute roles={['SUPER_ADMIN']}>
              <TenantListPage />
            </ProtectedRoute>
          }
        />
        <Route path="/super-admin" element={<Navigate to="/super-admin/tenants" replace />} />

        {/* School Admin portal — SCHOOL_ADMIN role required */}
        <Route
          path="/school-admin"
          element={
            <ProtectedRoute roles={['SCHOOL_ADMIN']}>
              <SchoolAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SchoolAdminDashboardPage />} />
          {/* Remaining school-admin routes (academic years, classes, etc.) added in C6+ */}
        </Route>

        {/* Authenticated catch-all → role-appropriate home */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <Navigate to="/app/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* Root and catch-all */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
