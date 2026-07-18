import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToServices, type FirestoreService } from "@/lib/firestore/services";
import { getMyServices } from "@/lib/store";
import { tsToIso } from "@/lib/firestore/normalize";
import type { ServiceListing } from "@/data/catalog";

/**
 * Public service catalog — every active listing sellers have published.
 * Real-time from Firestore; falls back to locally stored listings when
 * Firebase is unconfigured.
 *
 * Results are shaped as ServiceListing so the existing card components render
 * Firestore records without change.
 */
export function useServices(pageSize = 200) {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const useFirestore = isFirebaseConfigured;

  useEffect(() => {
    if (!useFirestore) {
      setServices(
        getMyServices()
          .filter((s) => s.status === "active")
          .map((s) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            categoryIcon: stripPrefix(s.categoryIcon),
            seller: "You",
            sellerInitial: "Y",
            location: s.district,
            district: s.district,
            price: s.price,
            rating: s.rating ?? 0,
            reviews: 0,
            type: s.type,
            postedAt: new Date(s.createdAt),
            description: s.description,
            tags: s.tags,
            priceUnit: s.priceUnit,
          }))
      );
      setLoading(false);
      return;
    }

    let settled = false;
    // Connection-level failures (missing database, offline) never reach the
    // snapshot callback, so stop the spinner rather than hang indefinitely.
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) setLoading(false);
    }, 5000);

    const unsub = subscribeToServices(
      { pageSize },
      (docs) => {
        settled = true;
        setServices(docs.map(toServiceListing));
        setLoading(false);
      },
      (err) => {
        settled = true;
        setError(
          err instanceof Error ? err.message : "Could not load services."
        );
        setLoading(false);
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, [pageSize, useFirestore]);

  return { services, loading, error };
}

function toServiceListing(s: FirestoreService): ServiceListing {
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    categoryIcon: stripPrefix(s.categoryIcon),
    seller: s.sellerName ?? "Seller",
    sellerInitial: (s.sellerName ?? "S").charAt(0).toUpperCase(),
    location: s.location ?? s.district,
    district: s.district,
    price: s.price,
    rating: s.rating ?? 0,
    reviews: s.reviewCount ?? 0,
    type: s.type,
    postedAt: new Date(tsToIso(s.createdAt)),
    badge: s.badge ?? undefined,
    badgeIcon: s.badgeIcon ?? undefined,
    description: s.description,
    tags: s.tags,
    priceUnit: s.priceUnit,
    sellerVerified: s.sellerVerified,
    sellerBio: s.sellerBio,
    sellerPhone: s.sellerPhone,
    sellerMember: s.sellerMember,
    sellerJobs: s.sellerJobs,
    sellerId: s.sellerId,
  };
}

/** Icons are stored inconsistently as "fa-x" or "fas fa-x"; cards add the "fas". */
function stripPrefix(icon?: string): string {
  return (icon ?? "fa-star").replace(/^fas\s+/, "");
}
