import { getApp,getApps,initializeApp } from "firebase/app";
import { connectAuthEmulator,getAuth } from "firebase/auth";
import {
connectFirestoreEmulator,
getFirestore,
initializeFirestore,
memoryLocalCache,
} from "firebase/firestore";
import { connectFunctionsEmulator,getFunctions } from "firebase/functions";
import { connectStorageEmulator,getStorage } from "firebase/storage";

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
 * Missing configuration disables authenticated data workflows.
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
            localCache: memoryLocalCache(),
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
const emulatorState=globalThis as typeof globalThis & { __needlyEmulatorsConnected?:boolean };
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === "true" && !emulatorState.__needlyEmulatorsConnected) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage,"127.0.0.1",9199);
  connectFunctionsEmulator(getFunctions(app,"us-central1"),"127.0.0.1",5002);
  emulatorState.__needlyEmulatorsConnected=true;
}

export default app;
