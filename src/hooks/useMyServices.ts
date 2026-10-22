import { getUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { tsToIso } from "@/lib/firestore/normalize";
import {
addFirestoreService,
deleteFirestoreService,
subscribeToMyServices,
updateFirestoreService,
type FirestoreService,
} from "@/lib/firestore/services";
import {
type StoredService,
} from "@/lib/store";
import { useCallback,useEffect,useState } from "react";

/**
 * Real-time hook for a seller's own services.
 * - Firestore when Firebase configured (real-time across devices)
 * - Database failures are surfaced without creating browser-only records.
 */
export function useMyServices() {
  const [services, setServices] = useState<StoredService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getUser();

  useEffect(() => {
    if (!user) {
      setServices([]);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) { setServices([]); setLoading(false); return; }

    const timer = window.setTimeout(() => { setError("Your services are taking longer than expected. Check your connection."); setLoading(false); }, 8000);
    const unsub = subscribeToMyServices(user.id, (data) => {
      window.clearTimeout(timer);
      setError(null);
      setServices(data.map((s) => ({ ...s, createdAt: tsToIso(s.createdAt) })));
      setLoading(false);
    }, () => { window.clearTimeout(timer); setError("Could not load your services. Please check your connection."); setLoading(false); });
    return () => { window.clearTimeout(timer); unsub(); };
  }, [user?.id]);

  const add = useCallback(
    async (service: StoredService) => {
      if (user && isFirebaseConfigured) {
        const id = await addFirestoreService({
          ...service,
          sellerId: user.id,
          sellerName: user.name,
          sellerPhone: user.phone,
          sellerVerified: false, reviewCount:0,
          sellerBio: user.bio,
        } as Omit<FirestoreService, "id" | "createdAt" | "updatedAt">);
        return id;
      } else {
        throw new Error("Database is unavailable.");
      }
    },
    [user?.id]
  );

  const update = useCallback(
    async (id: string, updates: Partial<StoredService>) => {
      if (isFirebaseConfigured) {
        await updateFirestoreService(id, updates);
      } else {
        throw new Error("Database is unavailable.");
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    if (isFirebaseConfigured) {
      await deleteFirestoreService(id);
    } else {
      throw new Error("Database is unavailable.");
    }
  }, []);

  return { services, loading, error, add, update, remove };
}
