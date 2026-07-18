import { useMemo, useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getTopReviews } from "@/lib/firestore/reviews";
import { tsToIso } from "@/lib/firestore/normalize";
import type { UIReview } from "@/hooks/useService";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";

/**
 * Headline platform numbers, computed from publicly readable collections only
 * (services and categories) so they work for signed-out visitors on the home
 * page. Everything here is a real count — no padding.
 */
export function usePlatformStats() {
  const { services, loading: servicesLoading } = useServices();
  const { categories, loading: categoriesLoading } = useCategories();

  return useMemo(() => {
    const sellers = new Set(services.map((s) => s.sellerId ?? s.seller));
    const districts = new Set(services.map((s) => s.district).filter(Boolean));
    const rated = services.filter((s) => s.reviews > 0);
    const reviewTotal = services.reduce((sum, s) => sum + s.reviews, 0);

    return {
      loading: servicesLoading || categoriesLoading,
      sellerCount: sellers.size,
      serviceCount: services.length,
      categoryCount: categories.length,
      districtCount: districts.size,
      reviewCount: reviewTotal,
      /** Mean rating across listings that actually have reviews; 0 when none. */
      averageRating: rated.length
        ? rated.reduce((sum, s) => sum + s.rating, 0) / rated.length
        : 0,
    };
  }, [services, categories, servicesLoading, categoriesLoading]);
}

/** Recent 4★+ reviews used as home-page testimonials. */
export function useTopReviews(n = 3) {
  const [reviews, setReviews] = useState<UIReview[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getTopReviews(n)
      .then((docs) => {
        if (cancelled) return;
        setReviews(
          docs.map((r) => ({
            id: r.id,
            author: r.author,
            initial: r.initial || r.author.charAt(0).toUpperCase(),
            rating: r.rating,
            text: r.text,
            date: new Date(tsToIso(r.createdAt)),
            reply: r.reply,
          }))
        );
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [n]);

  return { reviews, loading };
}
