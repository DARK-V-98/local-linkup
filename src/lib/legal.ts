/**
 * Business details shown on every legal/policy page.
 *
 * Payment gateways (PayHere, bank IPGs such as Sampath, Commercial Bank, HNB,
 * Seylan, People's Bank, and card networks Visa/Mastercard) check that the
 * merchant's legal identity and contact details are visible on the website.
 * Fill these in with the details EXACTLY as they appear on your Business
 * Registration certificate and business bank account. Empty values are hidden.
 */
export const LEGAL = {
  /** Brand used on the site. */
  brandName: "Needlyy",
  /** Registered legal name, e.g. "Needlyy (Private) Limited" or the sole-proprietor business name. */
  legalName: "",
  /** Business Registration / Company number, e.g. "PV 123456" or "WCO/12345". */
  registrationNo: "",
  /** Registered business address. */
  address: "",
  /** Support email (also editable in Admin → Settings). */
  email: "support@needlyy.lk",
  /** Support hotline in +94 format (also editable in Admin → Settings). */
  phone: "",
  /** Website domain. */
  website: "needlyy.lk",
  /** Date the current versions of the policies take effect. */
  effectiveDate: "18 November 2026",
  /** Business days to respond to a refund request / complaint. */
  responseDays: 3,
  /** Days within which a buyer may raise a dispute after the seller marks work complete. */
  disputeWindowDays: 7,
  /** Working days for an approved card refund to reach the customer (bank-dependent). */
  refundProcessingDays: "7–14",
} as const;

export const LEGAL_PAGES = [
  { to: "/terms", label: "Terms & Conditions", icon: "fa-file-contract" },
  { to: "/privacy", label: "Privacy Policy", icon: "fa-user-shield" },
  { to: "/refund-policy", label: "Refund & Cancellation", icon: "fa-rotate-left" },
  { to: "/service-delivery", label: "Service Delivery", icon: "fa-truck-fast" },
  { to: "/payment-security", label: "Payment & Security", icon: "fa-lock" },
] as const;
