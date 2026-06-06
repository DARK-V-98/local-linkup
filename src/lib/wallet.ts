// Needly Wallet — persisted in localStorage
// Tracks buyer wallet balance and transaction ledger

export interface WalletTransaction {
  id: string;
  type: "topup" | "payment" | "refund" | "cashback";
  desc: string;
  amount: number;       // positive = credit, negative = debit
  status: "completed" | "pending" | "refunded";
  bookingId?: string;
  createdAt: string;
}

const WALLET_KEY = "needly_wallet";
const TX_KEY = "needly_transactions";

const DEFAULT_TX: WalletTransaction[] = [
  { id: "TX-001", type: "topup",    desc: "Wallet Top-up",                   amount:  10000, status: "completed", createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: "TX-002", type: "payment",  desc: "Payment for Plumbing Service",    amount: -5500,  status: "completed", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "TX-003", type: "cashback", desc: "5% Cashback on Plumbing",         amount:  275,   status: "completed", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "TX-004", type: "payment",  desc: "Payment for Logo Design",         amount: -8500,  status: "completed", createdAt: new Date(Date.now() -  8 * 86400000).toISOString() },
  { id: "TX-005", type: "refund",   desc: "Refund — Cancelled Booking",      amount:  3500,  status: "refunded",  createdAt: new Date(Date.now() -  5 * 86400000).toISOString() },
  { id: "TX-006", type: "payment",  desc: "Payment for AC Service",          amount: -4200,  status: "completed", createdAt: new Date(Date.now() -  3 * 86400000).toISOString() },
  { id: "TX-007", type: "cashback", desc: "5% Cashback on AC Service",       amount:  210,   status: "completed", createdAt: new Date(Date.now() -  3 * 86400000).toISOString() },
];

function seedWallet() {
  if (!localStorage.getItem(TX_KEY)) {
    localStorage.setItem(TX_KEY, JSON.stringify(DEFAULT_TX));
    // Balance = sum of defaults
    const bal = DEFAULT_TX.reduce((s, t) => s + t.amount, 0);
    localStorage.setItem(WALLET_KEY, String(Math.max(0, bal)));
  }
}

export function getWalletBalance(): number {
  seedWallet();
  return Number(localStorage.getItem(WALLET_KEY) ?? 0);
}

export function getTransactions(): WalletTransaction[] {
  seedWallet();
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) ?? "[]") as WalletTransaction[];
  } catch {
    return [];
  }
}

export function addTransaction(tx: Omit<WalletTransaction, "id" | "createdAt">): WalletTransaction {
  const all = getTransactions();
  const newTx: WalletTransaction = {
    ...tx,
    id: "TX-" + Date.now(),
    createdAt: new Date().toISOString(),
  };
  all.unshift(newTx);
  localStorage.setItem(TX_KEY, JSON.stringify(all));
  // Update balance
  const bal = Math.max(0, getWalletBalance() + tx.amount);
  localStorage.setItem(WALLET_KEY, String(bal));
  window.dispatchEvent(new Event("needly-wallet-change"));
  return newTx;
}

export function topUpWallet(amount: number): void {
  addTransaction({ type: "topup", desc: "Wallet Top-up via PayHere", amount, status: "completed" });
  // 5% cashback on top-up
  const cashback = Math.round(amount * 0.05);
  if (cashback > 0) {
    addTransaction({ type: "cashback", desc: "5% Cashback Reward", amount: cashback, status: "completed" });
  }
}

export function payFromWallet(amount: number, desc: string, bookingId?: string): boolean {
  const bal = getWalletBalance();
  if (bal < amount) return false;
  addTransaction({ type: "payment", desc, amount: -amount, status: "completed", bookingId });
  return true;
}

export function refundToWallet(amount: number, desc: string, bookingId?: string): void {
  addTransaction({ type: "refund", desc, amount, status: "refunded", bookingId });
}
