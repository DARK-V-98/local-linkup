import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToUsers, type UserProfile } from "@/lib/firestore/users";

/**
 * Live list of every registered user, for admin screens.
 * Reads are gated to signed-in users by the security rules; the admin screens
 * behind this hook are already role-guarded by ProtectedRoute.
 */
export function useAllUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) setLoading(false);
    }, 5000);

    const unsub = subscribeToUsers(
      (docs) => {
        settled = true;
        setUsers(docs);
        setLoading(false);
      },
      (err) => {
        settled = true;
        setError(err instanceof Error ? err.message : "Could not load users.");
        setLoading(false);
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  return { users, loading, error };
}
