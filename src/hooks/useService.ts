import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchServiceById, type FirestoreService } from "@/lib/firestore/services";
import { subscribeToServiceReviews, getReviewsBySeller, type FSReview } from "@/lib/firestore/reviews";
import { getMyServices } from "@/lib/store";
import { tsToIso } from "@/lib/firestore/normalize";
import type { ServiceListing } from "@/data/catalog";

/** A review shaped for the UI, with the Firestore Timestamp already resolved. */
export interface UIReview {
  id: string;
  author: string;
  initial: string;
  rating: number;
  text: string;
  date: Date;
  reply?: string;
}

/** Loads one published service by id, plus its live review list. */
export function useService(id: string | undefined) {
  const [service, setService] = useState<ServiceListing | null>(null);
  const [reviews, setReviews] = useState<UIReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setService(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    if (!isFirebaseConfigured) {
      const local = getMyServices().find((s) => s.id === id);
      setService(
        local
          ? {
              id: local.id,
              title: local.title,
              category: local.category,
              categoryIcon: local.categoryIcon.replace(/^fas\s+/, ""),
              seller: "You",
              sellerInitial: "Y",
              location: local.district,
              district: local.district,
              price: local.price,
              rating: local.rating ?? 0,
              reviews: 0,
              type: local.type,
              postedAt: new Date(local.createdAt),
              description: local.description,
              tags: local.tags,
              priceUnit: local.priceUnit,
            }
          : null
      );
      setLoading(false);
      return;
    }

    fetchServiceById(id)
      .then((doc) => {
        if (cancelled) return;
        setService(doc ? toServiceListing(doc) : null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    const unsub = subscribeToServiceReviews(id, (docs) => {
      if (!cancelled) setReviews(docs.map(toUIReview));
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [id]);

  return { service, reviews, loading };
}

/** Every review left across all of one seller's listings. */
export function useSellerReviews(sellerId: string | undefined) {
  const [reviews, setReviews] = useState<UIReview[]>([]);
  const [loading, setLoading] = useState(Boolean(sellerId) && isFirebaseConfigured);

  useEffect(() => {
    if (!sellerId || !isFirebaseConfigured) {
      setReviews([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getReviewsBySeller(sellerId)
      .then((docs) => {
        if (cancelled) return;
        setReviews(docs.map(toUIReview));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [sellerId]);

  return { reviews, loading };
}

function toUIReview(r: FSReview): UIReview {
  return {
    id: r.id,
    author: r.author,
    initial: r.initial || r.author.charAt(0).toUpperCase(),
    rating: r.rating,
    text: r.text,
    date: new Date(tsToIso(r.createdAt)),
    reply: r.reply,
  };
}

function toServiceListing(s: FirestoreService): ServiceListing {
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    categoryIcon: (s.categoryIcon ?? "fa-star").replace(/^fas\s+/, ""),
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
