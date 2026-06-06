// PayHere (Sri Lanka) payment gateway integration
// Docs: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout

declare global {
  interface Window {
    payhere?: {
      pay: (payment: PayHerePayment) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

export interface PayHerePayment {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash?: string;
}

// Needly PayHere sandbox merchant ID
const MERCHANT_ID = "1227138";
const SANDBOX = true; // Set to false in production with real merchant ID

export function loadPayHereSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.payhere) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.onload = () => resolve();
    script.onerror = () => resolve(); // fail silently, handled at checkout
    document.head.appendChild(script);
  });
}

export interface CheckoutOptions {
  orderId: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  district: string;
  onSuccess: (orderId: string) => void;
  onDismissed: () => void;
  onError: (error: string) => void;
}

export async function openPayHereCheckout(opts: CheckoutOptions): Promise<void> {
  await loadPayHereSDK();

  if (!window.payhere) {
    opts.onError("PayHere SDK could not be loaded. Please try again.");
    return;
  }

  const nameParts = opts.customerName.trim().split(" ");
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "User";

  window.payhere.onCompleted = opts.onSuccess;
  window.payhere.onDismissed = opts.onDismissed;
  window.payhere.onError = opts.onError;

  const payment: PayHerePayment = {
    sandbox: SANDBOX,
    merchant_id: MERCHANT_ID,
    return_url: `${window.location.origin}/dashboard/buyer/payments`,
    cancel_url: window.location.href,
    notify_url: "https://needlyy.lk/api/payhere/notify", // server webhook (not active in demo)
    order_id: opts.orderId,
    items: opts.description,
    amount: (opts.amount / 100).toFixed(2), // PayHere uses LKR decimals
    currency: "LKR",
    first_name: firstName,
    last_name: lastName,
    email: opts.customerEmail || "customer@needlyy.lk",
    phone: opts.customerPhone.replace(/\D/g, "").slice(-10) || "0771234567",
    address: opts.district,
    city: opts.district,
    country: "Sri Lanka",
  };

  window.payhere.pay(payment);
}
