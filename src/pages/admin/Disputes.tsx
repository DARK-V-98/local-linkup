import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";

const adminSidebarItems = [
  { label: "Overview", to: "/admin", icon: "fa-chart-pie" },
  { label: "Orders", to: "/admin/orders", icon: "fa-cart-flatbed" },
  { label: "Payments", to: "/admin/payments", icon: "fa-money-bill-wave" },
  { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
  { label: "User Management", to: "/admin/users", icon: "fa-users" },
  { label: "Sellers", to: "/admin/sellers", icon: "fa-store" },
  { label: "Service Catalog", to: "/admin/services", icon: "fa-layer-group" },
  { label: "Categories", to: "/admin/categories", icon: "fa-tags" },
  { label: "Disputes", to: "/admin/disputes", icon: "fa-circle-exclamation" },
  { label: "System Settings", to: "/admin/settings", icon: "fa-gears" },
];

type DisputeStatus = "open" | "investigating" | "resolved" | "closed";
type DisputeType = "no_show" | "quality" | "payment" | "fraud" | "other";

interface DisputeMessage {
  from: "buyer" | "seller" | "admin";
  text: string;
  time: string;
}

interface Dispute {
  id: string;
  orderId: string;
  type: DisputeType;
  status: DisputeStatus;
  buyerName: string;
  sellerName: string;
  service: string;
  amount: number;
  raisedAt: string;
  description: string;
  messages: DisputeMessage[];
  resolution?: string;
}

const TYPE_LABELS: Record<DisputeType, string> = {
  no_show: "No-Show",
  quality: "Quality Issue",
  payment: "Payment Dispute",
  fraud: "Suspected Fraud",
  other: "Other",
};

const STATUS_STYLE: Record<DisputeStatus, string> = {
  open: "bg-rose-50 text-rose-600 border-rose-200",
  investigating: "bg-amber-50 text-amber-600 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
};

const TYPE_STYLE: Record<DisputeType, string> = {
  no_show: "bg-orange-50 text-orange-600",
  quality: "bg-blue-50 text-blue-600",
  payment: "bg-violet-50 text-violet-600",
  fraud: "bg-red-50 text-red-700",
  other: "bg-slate-100 text-slate-600",
};

const INITIAL: Dispute[] = [
  {
    id: "D-1001", orderId: "BK-4122", type: "no_show", status: "open",
    buyerName: "Saman Perera", sellerName: "Tharindu Plumbing", service: "Emergency Pipe Fix",
    amount: 5500, raisedAt: "30 mins ago",
    description: "Seller confirmed the booking but never arrived. I waited 2 hours and couldn't reach them.",
    messages: [
      { from: "buyer", text: "He said he would arrive at 10am but never showed up. My number is +94771234567.", time: "30 mins ago" },
    ],
  },
  {
    id: "D-1002", orderId: "BK-3987", type: "quality", status: "investigating",
    buyerName: "Nimal Dissanayake", sellerName: "Lanka Cleaners", service: "Deep Home Cleaning",
    amount: 8000, raisedAt: "2 hours ago",
    description: "The cleaning was incomplete. Bathrooms were not cleaned at all. I have photos.",
    messages: [
      { from: "buyer", text: "The team only cleaned 2 rooms out of 4. Bathrooms still dirty.", time: "2 hrs ago" },
      { from: "seller", text: "We cleaned everything as agreed. The buyer asked for extra rooms not in the original booking.", time: "1 hr ago" },
      { from: "admin", text: "We are reviewing the booking details and photos submitted. Please allow 24 hours.", time: "45 mins ago" },
    ],
  },
  {
    id: "D-1003", orderId: "BK-3755", type: "payment", status: "investigating",
    buyerName: "Kamani Rathnayake", sellerName: "Sky Electricals", service: "Wiring Installation",
    amount: 22000, raisedAt: "1 day ago",
    description: "Seller demanded Rs. 22,000 but the agreed price was Rs. 15,000. Refusing to leave without extra payment.",
    messages: [
      { from: "buyer", text: "We agreed on Rs.15,000 verbally. Now he wants Rs.22,000 saying extra parts were used.", time: "1 day ago" },
      { from: "seller", text: "We used additional fuses and wiring as the job was bigger than stated. Standard practice.", time: "20 hrs ago" },
    ],
  },
  {
    id: "D-1004", orderId: "BK-3601", type: "fraud", status: "open",
    buyerName: "Pradeep Silva", sellerName: "QuickFix Pro", service: "AC Repair",
    amount: 12000, raisedAt: "3 days ago",
    description: "Seller collected payment upfront then disappeared. Profile looks fake. Phone now unreachable.",
    messages: [
      { from: "buyer", text: "I paid Rs.12,000 via bank transfer. He collected money and blocked my number.", time: "3 days ago" },
    ],
  },
  {
    id: "D-1005", orderId: "BK-3210", type: "quality", status: "resolved",
    buyerName: "Anjali Fernando", sellerName: "Green Gardens", service: "Garden Landscaping",
    amount: 35000, raisedAt: "1 week ago",
    description: "Plants died within 3 days. Seller refused to replace.",
    messages: [
      { from: "buyer", text: "All 12 plants died. Seller promised 1-month guarantee but is ignoring messages.", time: "1 week ago" },
      { from: "seller", text: "The customer didn't water the plants as instructed.", time: "6 days ago" },
      { from: "admin", text: "After review, seller has agreed to replace 6 plants as a goodwill gesture. Dispute resolved.", time: "4 days ago" },
    ],
    resolution: "Partial refund of Rs.15,000 issued. Seller replaced 6 plants. Both parties agreed.",
  },
];

export default function Disputes() {
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL);
  const [filter, setFilter] = useState<DisputeStatus | "all">("open");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [replyText, setReplyText] = useState("");
  const [resolution, setResolution] = useState("");

  const counts = {
    all: disputes.length,
    open: disputes.filter((d) => d.status === "open").length,
    investigating: disputes.filter((d) => d.status === "investigating").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
    closed: disputes.filter((d) => d.status === "closed").length,
  };

  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);

  const sendReply = () => {
    if (!replyText.trim() || !selected) return;
    const msg: DisputeMessage = { from: "admin", text: replyText, time: "Just now" };
    setDisputes((prev) => prev.map((d) => d.id === selected.id ? { ...d, messages: [...d.messages, msg], status: d.status === "open" ? "investigating" : d.status } : d));
    setSelected((prev) => prev ? { ...prev, messages: [...prev.messages, msg], status: prev.status === "open" ? "investigating" : prev.status } : null);
    setReplyText("");
    toast.success("Message sent to both parties.");
  };

  const resolveDispute = () => {
    if (!resolution.trim() || !selected) return;
    setDisputes((prev) => prev.map((d) => d.id === selected.id ? { ...d, status: "resolved", resolution } : d));
    setSelected((prev) => prev ? { ...prev, status: "resolved", resolution } : null);
    toast.success("Dispute marked as resolved.");
    setResolution("");
  };

  const closeDispute = (id: string) => {
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "closed" } : d));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: "closed" } : null);
    toast.success("Dispute closed.");
  };

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dispute Resolution</h1>
          <p className="text-slate-500 font-medium mt-1">Mediate and resolve buyer-seller conflicts.</p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-sm font-bold text-rose-700">{counts.open} open disputes</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {(["all", "open", "investigating", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-2xl border text-left transition ${filter === s ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 hover:border-slate-300"}`}
          >
            <div className={`text-2xl font-black ${filter === s ? "text-white" : "text-slate-900"}`}>{counts[s as keyof typeof counts] ?? 0}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-400 capitalize">{s}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 min-w-0 space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <i className="fas fa-handshake text-3xl mb-3 block" />
              <div className="font-bold">No {filter} disputes</div>
            </div>
          )}
          {filtered.map((dispute) => (
            <div
              key={dispute.id}
              onClick={() => setSelected(dispute)}
              className={`bg-white rounded-2xl border cursor-pointer transition hover:border-slate-300 p-5 ${selected?.id === dispute.id ? "border-slate-900 shadow-soft" : "border-slate-200"}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 text-sm font-bold ${TYPE_STYLE[dispute.type]}`}>
                  <i className={`fas ${dispute.type === "fraud" ? "fa-triangle-exclamation" : dispute.type === "payment" ? "fa-money-bill" : dispute.type === "no_show" ? "fa-ghost" : "fa-star-half-stroke"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-slate-900 text-sm">#{dispute.id}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLE[dispute.status]}`}>{dispute.status}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${TYPE_STYLE[dispute.type]}`}>{TYPE_LABELS[dispute.type]}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 line-clamp-1">{dispute.service}</div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    {dispute.buyerName} vs {dispute.sellerName} · Rs. {dispute.amount.toLocaleString()} · {dispute.raisedAt}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-400 shrink-0">Order {dispute.orderId}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-96 shrink-0 hidden xl:block">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft sticky top-28 flex flex-col max-h-[calc(100vh-10rem)]">
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-black text-slate-900">Dispute #{selected.id}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Order {selected.orderId} · {selected.raisedAt}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-slate-100 grid place-items-center hover:bg-slate-200 transition shrink-0">
                    <i className="fas fa-xmark text-xs text-slate-500" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${TYPE_STYLE[selected.type]}`}>{TYPE_LABELS[selected.type]}</span>
                </div>
              </div>

              {/* Parties */}
              <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Buyer</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selected.buyerName}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Seller</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selected.sellerName}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Service</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{selected.service}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Amount</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">Rs. {selected.amount.toLocaleString()}</div>
                </div>
              </div>

              {/* Description */}
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Complaint</div>
                <p className="text-xs text-slate-700 leading-relaxed">{selected.description}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {selected.messages.map((msg, i) => (
                  <div key={i} className={`text-xs rounded-xl p-3 ${msg.from === "admin" ? "bg-slate-900 text-white" : msg.from === "buyer" ? "bg-blue-50 text-blue-900" : "bg-slate-50 text-slate-700"}`}>
                    <div className="font-black capitalize mb-1">{msg.from} <span className="font-normal opacity-60">· {msg.time}</span></div>
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Actions */}
              {selected.status !== "resolved" && selected.status !== "closed" && (
                <div className="p-4 border-t border-slate-100 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendReply()}
                      placeholder="Send message to both parties..."
                      className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button onClick={sendReply} className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center hover:bg-slate-800 transition shrink-0">
                      <i className="fas fa-paper-plane text-xs" />
                    </button>
                  </div>
                  <input
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Resolution summary..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={resolveDispute} className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
                      <i className="fas fa-check mr-1" /> Resolve
                    </button>
                    <button onClick={() => closeDispute(selected.id)} className="py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition">
                      <i className="fas fa-xmark mr-1" /> Close
                    </button>
                  </div>
                </div>
              )}

              {selected.resolution && (
                <div className="px-6 py-4 border-t border-emerald-100 bg-emerald-50 rounded-b-3xl">
                  <div className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-1">Resolution</div>
                  <p className="text-xs text-emerald-800">{selected.resolution}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
