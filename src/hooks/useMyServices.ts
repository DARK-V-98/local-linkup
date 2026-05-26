import { useState, useEffect, useCallback } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToMyServices,
  addFirestoreService,
  updateFirestoreService,
  deleteFirestoreService,
  type FirestoreService,
} from "@/lib/firestore/services";
import {
  getMyServices,
  addService,
  updateService,
  deleteService,
  type StoredService,
} from "@/lib/store";
import { getUser } from "@/lib/auth";

/**
 * Real-time hook for a seller's own services.
 * - Firestore when Firebase configured (real-time across devices)
 * - localStorage fallback otherwise
 */
export function useMyServices() {
  const [services, setServices] = useState<StoredService[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== "seller") {
      setServices([]);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      setServices(getMyServices());
      setLoading(false);
      return;
    }

    const unsub = subscribeToMyServices(user.id, (data) => {
      setServices(data);
      setLoading(false);
    });
    return unsub;
  }, [user?.id]);

  const add = useCallback(
    async (service: StoredService) => {
      if (user && isFirebaseConfigured) {
        const id = await addFirestoreService({
          ...service,
          sellerId: user.id,
          sellerName: user.name,
          sellerPhone: user.phone,
          sellerVerified: user.verified,
          sellerBio: user.bio,
        } as Omit<FirestoreService, "id" | "createdAt" | "updatedAt">);
        return id;
      } else {
        addService(service);
        setServices(getMyServices());
        return service.id;
      }
    },
    [user?.id]
  );

  const update = useCallback(
    async (id: string, updates: Partial<StoredService>) => {
      if (isFirebaseConfigured) {
        await updateFirestoreService(id, updates);
      } else {
        updateService(id, updates);
        setServices(getMyServices());
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    if (isFirebaseConfigured) {
      await deleteFirestoreService(id);
    } else {
      deleteService(id);
      setServices(getMyServices());
    }
  }, []);

  return { services, loading, add, update, remove };
}
