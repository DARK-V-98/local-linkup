import { getFunctions,httpsCallable } from "firebase/functions";
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

  const response=await httpsCallable<{bookingId:string},PayHerePayment>(getFunctions(undefined,"us-central1"),"createCheckout")({bookingId:opts.orderId});
  window.payhere.onCompleted = opts.onSuccess;
  window.payhere.onDismissed = opts.onDismissed;
  window.payhere.onError = opts.onError;
  window.payhere.pay(response.data);
}
