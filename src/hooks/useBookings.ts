import { useState, useEffect, useCallback } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToBookingsByBuyer,
  subscribeToBookingsBySeller,
  updateFirestoreBookingStatus,
  type FirestoreBooking,
} from "@/lib/firestore/bookings";
import {
  getBookings,
  updateBookingStatus,
  type StoredBooking,
} from "@/lib/store";
import { getUser } from "@/lib/auth";

type Booking = FirestoreBooking | StoredBooking;

/**
 * Real-time bookings hook.
 * - Uses Firestore when Firebase is configured
 * - Falls back to localStorage otherwise
 */
export function useBookings(perspective?: "buyer" | "seller") {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getUser();

  useEffect(() => {
    setBookings([]);
    setError(null);
    setLoading(true);
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // localStorage fallback
      setBookings(getBookings());
      setLoading(false);
      const refresh = () => setBookings(getBookings());
      window.addEventListener("needly-bookings-change", refresh);
      return () => window.removeEventListener("needly-bookings-change", refresh);
    }

    let unsub: () => void;
    const timer = window.setTimeout(() => {
      setError("Booking updates are taking longer than expected. Please check your connection.");
      setLoading(false);
    }, 8000);
    const receive = (data: FirestoreBooking[]) => {
      window.clearTimeout(timer);
      setBookings(data);
      setError(null);
      setLoading(false);
    };
    const fail = () => {
      window.clearTimeout(timer);
      setError("Could not load your bookings. Please check your connection or permissions.");
      setLoading(false);
    };
    if ((perspective ?? user.role) === "seller") {
      unsub = subscribeToBookingsBySeller(user.id, receive, fail);
    } else {
      unsub = subscribeToBookingsByBuyer(user.id, receive, fail);
    }
    return () => { window.clearTimeout(timer); unsub?.(); };
  }, [user?.id, user?.role, perspective]);

  const updateStatus = useCallback(
    async (id: string, status: StoredBooking["status"], note?: string) => {
      if (isFirebaseConfigured) {
        await updateFirestoreBookingStatus(id, status, { note });
      } else {
        updateBookingStatus(id, status);
        setBookings(getBookings());
      }
    },
    []
  );

  return { bookings, loading, error, updateStatus };
}
