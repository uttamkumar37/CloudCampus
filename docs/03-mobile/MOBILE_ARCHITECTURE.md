# Mobile Architecture

The mobile app under `mobile` is an Expo React Native app for Android, iOS, and web. It is active and synced with the current backend read APIs for school admin, teacher, student, and parent roles.

## Current Structure
- `App.tsx`: root app, auth provider, login/home routing.
- `src/api/client.ts`: Axios client, JWT injection, refresh-token retry, tenant header handling, Android API base URL resolution.
- `src/api/projectApi.ts`: role-aware project sync layer that calls current backend endpoints and converts them into mobile dashboard cards.
- `src/auth/AuthContext.tsx`: login, logout, session hydration, and active-school switching.
- `src/auth/storage.ts`: secure/native or web fallback session persistence.
- `src/screens/LoginScreen.tsx`: tenant-aware login, including blank-tenant super-admin support.
- `src/screens/HomeScreen.tsx`: role-aware dashboard and API sync status surface.

## Supported Role Dashboards
- `SCHOOL_ADMIN`: school dashboard, academic years, classes, students, subjects, fee records, notices.
- `TEACHER`: teacher dashboard, timetable, homework review, assignment grading, mobile notices.
- `STUDENT`: attendance, homework, assignments, timetable, results, fees, Profile 360, mobile notices.
- `PARENT`: linked children, child attendance, results, homework, timetable, fees, mobile notices.

## Android Networking
Android cannot call the Mac backend through `localhost`. The app reads `extra.apiBaseUrlAndroid` from `mobile/app.json`; locally it is set to `http://10.89.241.90:8080`. Emulator fallback replaces `localhost` with `10.0.2.2`.

## Validation
- `npm run typecheck`
- `npx expo export --platform android`
- `npx expo export --platform web`
- Live API smoke across four roles: 33 pass, 0 fail.

## Current CI Risk
The GitHub Actions CI workflow still does not run mobile validation. Add `cd mobile && npm ci && npm run typecheck && npx expo export --platform android` before mobile is release-blocking.
