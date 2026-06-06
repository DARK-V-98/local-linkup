import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { getWalletBalance, getTransactions, topUpWallet, WalletTransaction } from "@/lib/wallet";
import { openPayHereCheckout } from "@/lib/payhere";
import { getUser } from "@/lib/auth";
import { usePageTitle } from "@/lib/usePageTitle";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Saved Sellers", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Payments", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

const TX_TYPE_CONFIG: Record<WalletTransaction["type"], { icon: string; color: string; bg: string }> = {
  topup:    { icon: "fa-arrow-down",      color: "text-emerald-600", bg: "bg-emerald-50" },
  payment:  { icon: "fa-arrow-up",        color: "text-slate-500",   bg: "bg-slate-100"  },
  refund:   { icon: "fa-rotate-left",     color: "text-amber-600",   bg: "bg-amber-50"   },
  cashback: { icon: "fa-gift",            color: "text-violet-600",  bg: "bg-violet-50"  },
};

const TOP_UP_AMOUNTS = [500, 1000, 2500, 5000, 10000];

function timeAgoShort(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short" });
}

export default function BuyerPayments() {
  usePageTitle("Payments & Wallet");
  const [balance, setBalance] = useState(getWalletBalance());
  const [transactions, setTransactions] = useState<WalletTransaction[]>(getTransactions());
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("1000");
  const [loadingTopUp, setLoadingTopUp] = useState(false);
  const [txFilter, setTxFilter] = useState<"all" | WalletTransaction["type"]>("all");

  const refresh = () => {
    setBalance(getWalletBalance());
    setTransactions(getTransactions());
  };

  useEffect(() => {
    window.addEventListener("needly-wallet-change", refresh);
    return () => window.removeEventListener("needly-wallet-change", refresh);
  }, []);

  // Cashback stats
  const cashbackTotal = transactions.filter((t) => t.type === "cashback").reduce((s, t) => s + t.amount, 0);
  const cashbackThisMonth = transactions
    .filter((t) => t.type === "cashback" && new Date(t.createdAt).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + t.amount, 0);
  const totalSpent = Math.abs(transactions.filter((t) => t.type === "payment").reduce((s, t) => s + t.amount, 0));

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 500) { toast.error("Minimum top-up is Rs. 500."); return; }
    setLoadingTopUp(true);
    const user = getUser();
    try {
      await openPayHereCheckout({
        orderId: "TOPUP-" + Date.now(),
        amount: amount * 100,
        description: `Needly Wallet Top-up`,
        customerName: user?.name ?? "Customer",
        customerEmail: user?.email ?? "customer@needlyy.lk",
        customerPhone: user?.phone ?? "0771234567",
        district: user?.district ?? "Colombo",
        onSuccess: () => {
          topUpWallet(amount);
          refresh();
          setShowTopUp(false);
          setLoadingTopUp(false);
          toast.success(`Rs. ${amount.toLocaleString()} added to your wallet! (+${Math.round(amount * 0.05).toLocaleString()} cashback 🎉)`);
        },
        onDismissed: () => {
          setLoadingTopUp(false);
          toast.info("Top-up cancelled.");
        },
        onError: (err) => {
          setLoadingTopUp(false);
          // Sandbox fallback — still credit the wallet for demo
          toast.info("PayHere sandbox: crediting wallet for demo purposes.");
          topUpWallet(amount);
          refresh();
          setShowTopUp(false);
          console.warn("PayHere error:", err);
        },
      });
    } catch {
      // PayHere not loaded — demo mode
      topUpWallet(amount);
      refresh();
      setShowTopUp(false);
      setLoadingTopUp(false);
      toast.success(`Rs. ${amount.toLocaleString()} added! (Demo mode)`);
    }
  };

  const displayed = txFilter === "all" ? transactions : transactions.filter((t) => t.type === txFilter);

  return (
    <DashboardShell role="Buyer" sidebarItems={buyerSidebarItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Payments & Wallet</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your Needly wallet and view transaction history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Wallet Balance", val: formatPrice(balance), icon: "fa-wallet", color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Total Spent", val: formatPrice(totalSpent), icon: "fa-arrow-up-right-dots", color: "text-slate-600", bg: "bg-slate-100" },
              { label: "Cashback Earned", val: formatPrice(cashbackTotal), icon: "fa-gift", color: "text-violet-600", bg: "bg-violet-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4">
                <span className={`w-8 h-8 rounded-xl ${s.bg} grid place-items-center mb-2`}>
                  <i className={`fas ${s.icon} text-xs ${s.color}`} />
                </span>
                <div className="text-base font-black text-slate-900">{s.val}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-black text-slate-900">Transaction History</h3>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {(["all", "topup", "payment", "refund", "cashback"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${txFilter === f ? "bg-white text-slate-900 shadow-soft" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {displayed.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-receipt text-3xl mb-3 block opacity-30" />
                <div className="font-bold text-sm">No transactions yet</div>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {displayed.map((tx) => {
                  const cfg = TX_TYPE_CONFIG[tx.type];
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${cfg.bg}`}>
                          <i className={`fas ${cfg.icon} text-sm ${cfg.color}`} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{tx.desc}</div>
                          <div className="text-xs text-slate-400">
                            {timeAgoShort(tx.createdAt)}
                            {tx.bookingId && <> · <span className="font-semibold">#{tx.bookingId}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm ${tx.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                          {tx.amount > 0 ? "+" : ""}Rs. {Math.abs(tx.amount).toLocaleString()}
                        </div>
                        <div className={`text-[10px] font-bold uppercase mt-0.5 capitalize ${
                          tx.status === "refunded" ? "text-amber-500" :
                          tx.status === "pending"  ? "text-blue-500"  : "text-emerald-500"
                        }`}>{tx.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-4">Accepted Payment Methods</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Visa / Mastercard", icon: "fa-credit-card", color: "text-blue-600", desc: "via PayHere" },
                { label: "Sampath iPay", icon: "fa-building-columns", color: "text-emerald-600", desc: "Internet banking" },
                { label: "HNB SOLO", icon: "fa-building-columns", color: "text-rose-600", desc: "Internet banking" },
                { label: "Needly Wallet", icon: "fa-wallet", color: "text-violet-600", desc: "Instant + 5% cashback" },
                { label: "Cash on Service", icon: "fa-money-bills", color: "text-amber-600", desc: "Pay vendor directly" },
                { label: "Bank Transfer", icon: "fa-right-left", color: "text-slate-600", desc: "Manual transfer" },
              ].map((m) => (
                <div key={m.label} className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                  <span className={`w-8 h-8 rounded-xl bg-slate-50 grid place-items-center shrink-0`}>
                    <i className={`fas ${m.icon} text-sm ${m.color}`} />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{m.label}</div>
                    <div className="text-[10px] text-slate-400">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet sidebar */}
        <div className="space-y-6">
          {/* Wallet card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern-light opacity-20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/10 grid place-items-center">
                  <i className="fas fa-wallet text-sm" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Needlyy Wallet</div>
                </div>
              </div>
              <div className="text-4xl font-black tracking-tight">Rs. {balance.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Earn <span className="text-primary font-bold">5% cashback</span> on every top-up. Use at checkout instantly.
              </p>
              <button
                onClick={() => setShowTopUp(!showTopUp)}
                className="w-full mt-5 py-3 bg-gradient-brand text-primary-foreground rounded-xl font-bold text-sm shadow-glow hover:scale-[1.02] transition"
              >
                <i className="fas fa-plus mr-2" /> Top Up Wallet
              </button>
            </div>
          </div>

          {/* Top-up panel */}
          {showTopUp && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5">
              <div className="font-black text-slate-900 mb-3 text-sm flex items-center justify-between">
                Top Up via PayHere
                <button onClick={() => setShowTopUp(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-xmark text-sm" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {TOP_UP_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(String(amt))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition ${topUpAmount === String(amt) ? "bg-slate-900 border-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Custom amount (min. 500)"
                min="500"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <i className="fas fa-gift text-violet-500" />
                Cashback: <strong className="text-violet-600">+Rs. {Math.round(parseInt(topUpAmount || "0") * 0.05).toLocaleString()}</strong>
              </div>
              <button
                onClick={handleTopUp}
                disabled={loadingTopUp}
                className="w-full bg-gradient-brand text-primary-foreground py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loadingTopUp
                  ? <><i className="fas fa-spinner fa-spin" /> Opening PayHere...</>
                  : <><i className="fas fa-bolt" /> Add Rs. {parseInt(topUpAmount || "0").toLocaleString()}</>}
              </button>
            </div>
          )}

          {/* Cashback summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <h3 className="font-black text-slate-900 mb-4 text-sm flex items-center gap-2">
              <i className="fas fa-gift text-violet-500" /> Cashback Summary
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "This month", val: formatPrice(cashbackThisMonth) },
                { label: "Total earned", val: formatPrice(cashbackTotal) },
                { label: "Cashback rate", val: "5% on top-ups" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-400 font-semibold">{r.label}</span>
                  <span className="font-bold text-slate-900">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <i className="fas fa-shield-halved text-emerald-600 text-lg mt-0.5" />
            <div className="text-xs text-emerald-800 leading-relaxed">
              <strong>Bank-grade security.</strong> All payments processed through PayHere — Sri Lanka's most trusted payment gateway, PCI-DSS compliant.
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
