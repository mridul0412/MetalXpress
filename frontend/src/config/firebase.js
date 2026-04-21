/**
 * Firebase configuration for BhavX frontend
 *
 * Used for: Phone OTP authentication (free, no DLT required)
 *
 * Setup:
 *   1. Go to console.firebase.google.com → your project
 *   2. Project Settings → General → Your apps → Web app config
 *   3. Copy values into VITE_ env vars in frontend/.env.local
 *
 * Required env vars (create frontend/.env.local):
 *   VITE_FIREBASE_API_KEY=AIzaSy...
 *   VITE_FIREBASE_AUTH_DOMAIN=bhavx-xxxxx.firebaseapp.com
 *   VITE_FIREBASE_PROJECT_ID=bhavx-xxxxx
 *   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

let app, auth;

if (isConfigured) {
  app  = initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  console.warn('[Firebase] Not configured — phone OTP will fall back to dev mode (any OTP accepted)');
  auth = null;
}

export { auth, isConfigured };
