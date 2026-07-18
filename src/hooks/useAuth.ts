import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { isFirebaseConfigured, auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore/users";
import { setUser, clearUser, getUser, resolveRole, type AuthUser } from "@/lib/auth";

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
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            // Keep the owner account on the developer role across reloads
            const resolved = {
              ...profile,
              role: resolveRole(profile.email, profile.role),
            };
            setUser(resolved);
            setLocalUser(resolved);
          } else {
            const email = firebaseUser.email ?? "";
            const minimal: AuthUser = {
              id: firebaseUser.uid,
              name:
                firebaseUser.displayName ??
                firebaseUser.email?.split("@")[0] ??
                "User",
              email,
              phone: firebaseUser.phoneNumber ?? "",
              role: resolveRole(email, "buyer"),
              district: "Colombo",
              verified: firebaseUser.emailVerified,
              joinedAt: new Date().toISOString().split("T")[0],
              avatarUrl: firebaseUser.photoURL ?? undefined,
            };
            setUser(minimal);
            setLocalUser(minimal);
          }
        } catch {
          // Network error or offline — keep existing cached session
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
