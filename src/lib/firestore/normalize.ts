import { Timestamp } from "firebase/firestore";

/**
 * Firestore stores dates as Timestamp objects while the localStorage layer
 * uses ISO strings. This converts either form to an ISO string so UI code
 * can treat every record uniformly.
 */
export function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}
