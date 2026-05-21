# Environment Setup

## Backend
Required local dependencies are provided by `docker compose up -d`. Run backend from `backend` with profile-specific environment variables for JWT, database, Redis, MinIO, RabbitMQ, mail, payment, and AI providers.

## Frontend
```bash
cd frontend
npm ci
npm run dev
```
Set API base URL through Vite environment configuration.

## Mobile
```bash
cd mobile
npm install
npm run web
npm run typecheck
npx expo export --platform android
```
Set Expo API base URLs through `app.json`/Expo extra config:
- `extra.apiBaseUrl`: browser/web URL, usually `http://localhost:8080`.
- `extra.apiBaseUrlAndroid`: Android device URL, currently `http://10.89.241.90:8080` for local LAN testing.

For Expo Go on Android, start Metro in LAN mode:

```bash
cd mobile
npx expo start --host lan --clear
```

Open `exp://10.89.241.90:8081` from Expo Go when the phone is on the same network.

## Secrets
Use `.env` and local vault helper scripts. Do not commit real credentials.
