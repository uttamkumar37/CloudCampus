import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { loginApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthUser } from '../types/auth';
import { useToast, Button } from '@/shared/ui';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(200),
  password: z.string().min(1, 'Password is required').max(200),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { success } = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const setTokens = useAuthStore((s) => s.setTokens);
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const passwordReset = (location.state as { passwordReset?: boolean })?.passwordReset ?? false;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 403) {
          setApiError('Account is not active. Please contact your administrator.');
        } else if (status === 429) {
          setApiError('Too many attempts. Please wait before trying again.');
        } else {
          setApiError('Invalid credentials. Please check your details and try again.');
        }
      } else {
        setApiError('Unable to sign in. Please try again.');
      }
    },
    onSuccess: (data) => {
      setApiError(null);
      const user: AuthUser = {
        userId: data.userId,
        role: data.role as AuthUser['role'],
        tenantId: data.tenantId,
        schoolId: data.schoolId ?? null,
        requiresPasswordChange: data.requiresPasswordChange,
        expiresIn: data.expiresIn,
        features: data.features ?? [],
      };
      setTokens(data.accessToken, data.refreshToken, user);
      queryClient.removeQueries({ queryKey: ['my-devices'] });
      success('Signed in successfully');

      if (data.requiresPasswordChange) {
        navigate('/change-password', { replace: true });
      } else {
        const role = data.role as string;
        const dest =
          role === 'SUPER_ADMIN'  ? '/super-admin/dashboard' :
          role === 'SCHOOL_ADMIN' ? '/school-admin/dashboard' :
          role === 'TEACHER'      ? '/teacher/dashboard' :
          role === 'STUDENT'      ? '/student/dashboard' :
          role === 'PARENT'       ? '/parent/dashboard' :
          '/app/dashboard';
        navigate(dest, { replace: true });
      }
    },
  });

  const onSubmit = (values: LoginFormValues) => mutate(values);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white text-xl font-bold shadow mb-3">C</div>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back to CloudCampus</p>
        </div>

        {passwordReset && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Password updated successfully. Sign in with your new password.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Email or Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              aria-describedby={errors.username ? 'username-error' : undefined}
              {...register('username')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.username && (
              <p id="username-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {apiError}
            </p>
          )}

          {/* Submit */}
          <Button type="submit" loading={isPending} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </main>
  );
}
