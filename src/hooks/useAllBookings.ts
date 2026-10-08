import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToAllBookings } from "@/lib/firestore/bookings";
import { getBookings, type StoredBooking } from "@/lib/store";
import { tsToIso } from "@/lib/firestore/normalize";

/**
 * Every booking on the platform, for admin reporting screens.
 * Falls back to the local booking store when Firebase is unconfigured.
 */
export function useAllBookings() {
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setBookings(getBookings());
      setLoading(false);
      const refresh = () => setBookings(getBookings());
      window.addEventListener("needly-bookings-change", refresh);
      return () => window.removeEventListener("needly-bookings-change", refresh);
    }

    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) { setError("Booking data is taking longer than expected. Check your connection."); setLoading(false); }
    }, 5000);

    const unsub = subscribeToAllBookings(
      (docs) => {
        settled = true;
        setError(null);
        setBookings(docs.map((b) => ({ ...b, createdAt: tsToIso(b.createdAt) }) as StoredBooking));
        setLoading(false);
      },
      () => {
        settled = true;
        setError("Could not load marketplace bookings. Check your connection or permissions.");
        setLoading(false);
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  return { bookings, loading, error };
}
