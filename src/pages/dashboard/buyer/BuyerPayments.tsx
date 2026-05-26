import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Payment Methods", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Account Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

interface PaymentMethod {
  id: string;
  type: "visa" | "master" | "bank" | "payhere" | "wallet";
  label: string;
  detail: string;
  isDefault: boolean;
}

const INITIAL_METHODS: PaymentMethod[] = [
  { id: "PM1", type: "visa", label: "Visa ending in 4242", detail: "Expires 08/26", isDefault: true },
  { id: "PM2", type: "bank", label: "Sampath Bank", detail: "Account ****8821", isDefault: false },
];

const CARD_ICONS: Record<string, string> = {
  visa: "fa-cc-visa",
  master: "fa-cc-mastercard",
  bank: "fa-building-columns",
  payhere: "fa-mobile-screen",
  wallet: "fa-wallet",
};

const CARD_COLORS: Record<string, string> = {
  visa: "text-blue-600",
  master: "text-red-500",
  bank: "text-emerald-600",
  payhere: "text-violet-600",
  wallet: "text-amber-600",
};

const TX_HISTORY = [
  { id: "TX-881", date: "Oct 22, 2024", desc: "Payment for Plumbing Service", amount: -5500, status: "completed" },
  { id: "TX-880", date: "Oct 20, 2024", desc: "Wallet Top-up", amount: 10000, status: "completed" },
  { id: "TX-879", date: "Oct 18, 2024", desc: "Payment for Logo Design", amount: -8500, status: "completed" },
  { id: "TX-878", date: "Oct 15, 2024", desc: "Refund — Cancelled Booking", amount: 3500, status: "refunded" },
  { id: "TX-877", date: "Oct 12, 2024", desc: "Payment for AC Service", amount: -4200, status: "completed" },
];

export default function BuyerPayments() {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("1000");
  const [wallet, setWallet] = useState(12400);
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    toast.success("Default payment method updated.");
  };

  const removeMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success("Payment method removed.");
  };

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.name || !cardForm.expiry || !cardForm.cvv) {
      toast.error("Please fill in all card details.");
      return;
    }
    const last4 = cardForm.number.replace(/\s/g, "").slice(-4);
    const newMethod: PaymentMethod = {
      id: "PM" + Date.now(),
      type: cardForm.number.startsWith("4") ? "visa" : "master",
      label: `${cardForm.number.startsWith("4") ? "Visa" : "Mastercard"} ending in ${last4}`,
      detail: "Expires " + cardForm.expiry,
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
    setCardForm({ number: "", name: "", expiry: "", cvv: "" });
    setShowAddCard(false);
    toast.success("Card added successfully.");
  };

  const doTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 500) { toast.error("Minimum top-up is Rs. 500."); return; }
    setWallet((w) => w + amount);
    setShowTopUp(false);
    toast.success(`Rs. ${amount.toLocaleString()} added to your wallet!`);
  };

  return (
    <DashboardShell role="Buyer" sidebarItems={buyerSidebarItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Payments</h1>
        <p className="text-slate-500 font-medium mt-1">Manage payment methods and view transaction history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment methods */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">Payment Methods</h3>
              <button onClick={() => setShowAddCard(true)} className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
                <i className="fas fa-plus" /> Add Card
              </button>
            </div>

            {methods.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <i className="fas fa-credit-card text-3xl mb-3 block opacity-30" />
                <div className="font-bold">No payment methods added</div>
              </div>
            )}

            <div className="space-y-3">
              {methods.map((m) => (
                <div key={m.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition ${m.isDefault ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"}`}>
                  <i className={`fab ${CARD_ICONS[m.type]} ${CARD_COLORS[m.type]} text-2xl w-8`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">{m.label}</div>
                    <div className="text-xs text-slate-400">{m.detail}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.isDefault ? (
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-full">Default</span>
                    ) : (
                      <button onClick={() => setDefault(m.id)} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition">Set Default</button>
                    )}
                    <button onClick={() => removeMethod(m.id)} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white transition grid place-items-center">
                      <i className="fas fa-trash text-[10px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add card form */}
            {showAddCard && (
              <form onSubmit={addCard} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="text-sm font-black text-slate-900 mb-2">Add New Card</div>
                <div className="relative">
                  <i className="fas fa-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                    placeholder="Card number" maxLength={19}
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <input value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  placeholder="Name on card"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    placeholder="MM/YY" maxLength={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  <input value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    placeholder="CVV" maxLength={4} type="password"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition">
                    Save Card
                  </button>
                  <button type="button" onClick={() => setShowAddCard(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Other payment options */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Also accepted</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "PayHere", icon: "fa-mobile-screen", color: "text-violet-600" },
                  { label: "Bank Transfer", icon: "fa-building-columns", color: "text-emerald-600" },
                  { label: "Cash on Service", icon: "fa-money-bills", color: "text-amber-600" },
                ].map((opt) => (
                  <div key={opt.label} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700">
                    <i className={`fas ${opt.icon} ${opt.color}`} /> {opt.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Transaction History</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {TX_HISTORY.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center ${tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      <i className={`fas ${tx.amount > 0 ? "fa-arrow-down" : "fa-arrow-up"} text-sm`} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{tx.desc}</div>
                      <div className="text-xs text-slate-400">{tx.date} · #{tx.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm ${tx.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                      {tx.amount > 0 ? "+" : ""}Rs. {Math.abs(tx.amount).toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-bold uppercase mt-0.5 ${tx.status === "refunded" ? "text-amber-500" : "text-emerald-500"}`}>{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern-light opacity-20" />
            <div className="relative">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Needlyy Wallet</div>
              <div className="text-4xl font-black mt-2">Rs. {wallet.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Use your wallet balance at checkout. Top up to earn <span className="text-primary-glow font-bold">5% cashback</span> on every booking.
              </p>
              <button onClick={() => setShowTopUp(!showTopUp)} className="w-full mt-5 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-soft hover:bg-slate-100 transition">
                <i className="fas fa-plus mr-2" /> Top Up Wallet
              </button>
            </div>
          </div>

          {showTopUp && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5">
              <div className="font-black text-slate-900 mb-3 text-sm">Top Up Amount</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button key={amt} onClick={() => setTopUpAmount(String(amt))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition ${topUpAmount === String(amt) ? "bg-slate-900 border-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Custom amount" min="500"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-slate-900" />
              <button onClick={doTopUp} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition">
                <i className="fas fa-bolt mr-1.5" /> Add Rs. {parseInt(topUpAmount || "0").toLocaleString()}
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 p-5">
            <h3 className="font-black text-slate-900 mb-3 text-sm">Cashback Summary</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Earned this month", val: "Rs. 620" },
                { label: "Total cashback", val: "Rs. 2,840" },
                { label: "Next reward at", val: "Rs. 5,000 spend" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-400 font-semibold">{r.label}</span>
                  <span className="font-bold text-slate-900">{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
