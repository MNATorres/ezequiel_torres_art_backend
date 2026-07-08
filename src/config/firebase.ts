import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { env } from './env';

let app: App | undefined;

// Lazily initialized so importing this module never triggers Firebase Admin
// setup on its own (mirrors the idempotent Mongo connection in src/index.ts).
export const getFirebaseAuth = (): Auth => {
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          // Vercel (and most hosts) store multiline env vars with literal `\n`.
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
  }
  return getAuth(app);
};
