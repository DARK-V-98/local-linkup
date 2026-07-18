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
/**
 * The project uses a NAMED database, "needlyy" — not the default one.
 * Both must line up with VITE_FIREBASE_PROJECT_ID: the name only exists inside
 * that project. Pointing at a database that does not exist fails every query
 * with NOT_FOUND, which looks exactly like an empty site.
 */
export const FIRESTORE_DATABASE_ID = "needlyy";

export const db = isFirebaseConfigured
  ? (() => {
      try {
        return initializeFirestore(
          app,
          {
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
          },
          FIRESTORE_DATABASE_ID
        );
      } catch {
        // Already initialized (hot-reload)
        return getFirestore(app, FIRESTORE_DATABASE_ID);
      }
    })()
  : getFirestore(app, FIRESTORE_DATABASE_ID);

// ─── Storage ───────────────────────────────────────────────────────────────────
export const storage = getStorage(app);

// ─── Emulator (dev only) ───────────────────────────────────────────────────────
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}

export default app;
