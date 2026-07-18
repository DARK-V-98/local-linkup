import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { isFirebaseConfigured, auth } from "@/lib/firebase";
import {
  setUser,
  clearUser,
  getUser,
  ensureProfileForUser,
  type AuthUser,
} from "@/lib/auth";

/**
 * Subscribes to Firebase Auth state changes and keeps the localStorage
 * session cache in sync. All existing `getUser()` calls stay valid.
 *
 * Falls back gracefully to the cached session when Firebase is not configured.
 */
export function useAuth() {
  const [user, setLocalUser] = useState<AuthUser | null>(() => getUser());
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Writes the profile to Firestore if it is missing, so a session
          // restored on page load can never leave the account undocumented.
          const profile = await ensureProfileForUser(firebaseUser);
          setUser(profile);
          setLocalUser(profile);
        } catch {
          // Network error or offline — keep the cached session and write
          // nothing. Guessing "missing" here would overwrite a real profile.
          setLocalUser(getUser());
        }
      } else {
        clearUser();
        setLocalUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  // React to same-window sign-in / sign-out dispatched via setUser / clearUser
  useEffect(() => {
    const onAuthChange = () => setLocalUser(getUser());
    window.addEventListener("needly-auth-change", onAuthChange);
    return () => window.removeEventListener("needly-auth-change", onAuthChange);
  }, []);

  return { user, loading };
}
