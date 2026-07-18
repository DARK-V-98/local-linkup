import { useState, useEffect, useCallback, useMemo } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToCategories,
  addFirestoreCategory,
  updateFirestoreCategory,
  deleteFirestoreCategory,
  seedCategories,
  type FirestoreCategory,
} from "@/lib/firestore/categories";
import { fetchCategoryCounts } from "@/lib/firestore/services";
import {
  getAdminCategories,
  saveAdminCategories,
  DEFAULT_CATEGORIES,
  type AdminCategory,
} from "@/lib/adminCategories";
import { getMyServices } from "@/lib/store";
import { hasAdminAccess } from "@/lib/auth";
import { tsToIso } from "@/lib/firestore/normalize";

interface UseCategoriesOptions {
  /** Include categories an admin has switched off. Admin screens want these. */
  includeInactive?: boolean;
  /** Join live per-category service counts. Skip on forms that don't show them. */
  withCounts?: boolean;
}

/**
 * Single source of truth for service categories.
 * - Firestore (real-time, shared across every device) when Firebase is configured
 * - localStorage fallback otherwise
 *
 * Seeds DEFAULT_CATEGORIES the first time the collection is found empty, so a
 * fresh deployment still has a usable category list for sellers to register under.
 */
export function useCategories(options: UseCategoriesOptions = {}) {
  const { includeInactive = false, withCounts = false } = options;
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useFirestore = isFirebaseConfigured;

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!useFirestore) {
      setCategories(getAdminCategories());
      setLoading(false);
      const onChange = () => setCategories(getAdminCategories());
      window.addEventListener("needly-categories-change", onChange);
      return () => window.removeEventListener("needly-categories-change", onChange);
    }

    let seeding = false;
    let settled = false;

    // Firestore retries connection errors (missing database, offline, blocked
    // network) forever without ever invoking the error callback, which would
    // leave the UI spinning. Fall back to the local defaults if nothing has
    // arrived by the time this fires.
    const fallbackTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setCategories(getAdminCategories());
      setLoading(false);
    }, 5000);

    const unsub = subscribeToCategories(
      (docs) => {
        settled = true;
        // First run on a fresh project: an admin writes the starter set and the
        // listener fires again with it. Everyone else just sees the local
        // defaults — only admins may write to /categories.
        if (docs.length === 0) {
          if (hasAdminAccess() && !seeding) {
            seeding = true;
            seedCategories(DEFAULT_CATEGORIES).catch(() => {
              setCategories(getAdminCategories());
              setLoading(false);
            });
            return;
          }
          setCategories(getAdminCategories());
          setLoading(false);
          return;
        }
        setCategories(docs.map(normalizeCategory));
        setLoading(false);
      },
      (err) => {
        settled = true;
        setError(err instanceof Error ? err.message : "Could not load categories.");
        setCategories(getAdminCategories());
        setLoading(false);
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, [useFirestore]);

  // ── Live service counts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!withCounts) return;
    let cancelled = false;

    if (!useFirestore) {
      const local = getMyServices().reduce<Record<string, number>>((acc, s) => {
        if (s.status === "active") acc[s.category] = (acc[s.category] ?? 0) + 1;
        return acc;
      }, {});
      setCounts(local);
      return;
    }

    fetchCategoryCounts()
      .then((c) => { if (!cancelled) setCounts(c); })
      .catch(() => { /* counts are decorative — a failure just shows 0 */ });

    return () => { cancelled = true; };
  }, [withCounts, useFirestore]);

  // ── Derived list ────────────────────────────────────────────────────────────
  const visible = useMemo(() => {
    return categories
      .filter((c) => includeInactive || c.active)
      .map((c) => ({ ...c, serviceCount: counts[c.name] ?? 0 }));
  }, [categories, counts, includeInactive]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const add = useCallback(
    async (cat: Omit<AdminCategory, "id" | "createdAt" | "order">) => {
      const order = categories.length;
      if (useFirestore) {
        return await addFirestoreCategory({ ...cat, order });
      }
      const next = [
        ...getAdminCategories(),
        { ...cat, order, id: `cat_${Date.now()}`, createdAt: new Date().toISOString() },
      ];
      saveAdminCategories(next);
      setCategories(next);
      return next[next.length - 1].id;
    },
    [categories.length, useFirestore]
  );

  const update = useCallback(async (id: string, updates: Partial<AdminCategory>) => {
    if (useFirestore) {
      await updateFirestoreCategory(id, updates);
      return;
    }
    const next = getAdminCategories().map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveAdminCategories(next);
    setCategories(next);
  }, [useFirestore]);

  const remove = useCallback(async (id: string) => {
    if (useFirestore) {
      await deleteFirestoreCategory(id);
      return;
    }
    const next = getAdminCategories().filter((c) => c.id !== id);
    saveAdminCategories(next);
    setCategories(next);
  }, [useFirestore]);

  return { categories: visible, loading, error, add, update, remove };
}

function normalizeCategory(doc: FirestoreCategory): AdminCategory {
  return {
    id: doc.id,
    name: doc.name,
    icon: doc.icon,
    description: doc.description ?? "",
    order: doc.order ?? 0,
    active: doc.active ?? true,
    createdAt: tsToIso(doc.createdAt),
  };
}
