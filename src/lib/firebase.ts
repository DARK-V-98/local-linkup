import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ─── Config ────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * True when all required Firebase env vars are present.
 * If false, the app falls back to localStorage for all data.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "your-api-key"
);

// ─── App ───────────────────────────────────────────────────────────────────────
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const auth = getAuth(app);

// ─── Firestore (with offline persistence) ─────────────────────────────────────
// Uses the project's default database. A named database ("needlyy") was
// configured previously but never created, so every query failed with
// NOT_FOUND and the app silently fell back to local mock data.
export const db = isFirebaseConfigured
  ? (() => {
      try {
        return initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        // Already initialized (hot-reload)
        return getFirestore(app);
      }
    })()
  : getFirestore(app);

// ─── Storage ───────────────────────────────────────────────────────────────────
export const storage = getStorage(app);

// ─── Emulator (dev only) ───────────────────────────────────────────────────────
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}

export default app;
