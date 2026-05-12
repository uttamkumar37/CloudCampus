/**
 * Typed access to environment variables.
 * All VITE_ variables are validated at startup.
 */
const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  appName: import.meta.env.VITE_APP_NAME ?? 'CloudCampus',
} as const;

export default env;
