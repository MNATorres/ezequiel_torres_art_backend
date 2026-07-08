import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { env } from './env';

let app: App | undefined;

// Normalizes the private key regardless of how it was pasted into the host's
// env vars: strips surrounding quotes (a common copy/paste artifact on Vercel)
// and turns literal `\n` sequences into real newlines. A key that already has
// real newlines passes through unchanged.
const normalizePrivateKey = (key: string): string =>
  key
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');

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
          privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY),
        }),
      });
  }
  return getAuth(app);
};
