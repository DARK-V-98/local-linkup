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
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // localStorage fallback
      setBookings(getBookings());
      setLoading(false);
      return;
    }

    let unsub: () => void;
    if (user.role === "seller") {
      unsub = subscribeToBookingsBySeller(user.id, (data) => {
        setBookings(data);
        setLoading(false);
      });
    } else {
      unsub = subscribeToBookingsByBuyer(user.id, (data) => {
        setBookings(data);
        setLoading(false);
      });
    }
    return () => unsub?.();
  }, [user?.id, user?.role]);

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

  return { bookings, loading, updateStatus };
}
