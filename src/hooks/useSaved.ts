import { useState, useEffect, useCallback } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToSaved,
  toggleFirestoreSaved,
  getSavedIds,
} from "@/lib/firestore/saved";
import {
  getSaved,
  toggleSaved as toggleLocalSaved,
} from "@/lib/saved";
import { getUser } from "@/lib/auth";

/**
 * Saved-services hook with real-time sync.
 * - Firestore when Firebase is configured (per-user, syncs across devices)
 * - localStorage fallback otherwise (anonymous save)
 */
export function useSaved() {
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(getSaved())
  );
  const [ready, setReady] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      // localStorage mode
      setSavedIds(new Set(getSaved()));
      setReady(true);
      return;
    }

    // Load initial state then subscribe to real-time updates
    getSavedIds(user.id).then((ids) => {
      setSavedIds(new Set(ids));
      setReady(true);
    });

    const unsub = subscribeToSaved(user.id, (ids) => {
      setSavedIds(new Set(ids));
    });
    return unsub;
  }, [user?.id]);

  const toggle = useCallback(
    async (serviceId: string): Promise<boolean> => {
      if (user && isFirebaseConfigured) {
        return await toggleFirestoreSaved(user.id, serviceId);
      } else {
        return toggleLocalSaved(serviceId);
      }
    },
    [user?.id]
  );

  const isSaved = useCallback(
    (serviceId: string) => savedIds.has(serviceId),
    [savedIds]
  );

  return { savedIds, isSaved, toggle, ready };
}
