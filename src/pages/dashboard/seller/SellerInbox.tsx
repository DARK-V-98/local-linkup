import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { usePageTitle } from "@/lib/usePageTitle";
import { getUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as fsSendMessage,
  markMessagesRead,
  type FSConversation,
  type FSMessage,
} from "@/lib/firestore/conversations";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

// ── Local types (match UI needs) ───────────────────────────────────────────────

interface UIMessage {
  id: string;
  from: "me" | "other";
  text: string;
  sentAt: Date;
  read: boolean;
}

interface UIConversation {
  id: string;
  buyerName: string;
  buyerInitial: string;
  buyerPhone?: string;
  serviceName: string;
  lastMessage: string;
  lastAt: Date;
  unread: number;
  online: boolean;
}

// ── Mock data fallback (used when Firebase not configured) ─────────────────────

const MOCK_CONVERSATIONS: UIConversation[] = [
  { id: "c1", buyerName: "Priyanka S.", buyerInitial: "P", serviceName: "Modern Logo Design", lastMessage: "Can you deliver the logo in SVG format?", lastAt: new Date(Date.now() - 120000), unread: 2, online: true },
  { id: "c2", buyerName: "Asanka K.", buyerInitial: "A", serviceName: "AC Servicing", lastMessage: "Is it available this Saturday at 10 AM?", lastAt: new Date(Date.now() - 3900000), unread: 1, online: false },
  { id: "c3", buyerName: "Malith D.", buyerInitial: "M", serviceName: "Social Media Kit", lastMessage: "Perfect! The designs look amazing, thanks!", lastAt: new Date(Date.now() - 10800000), unread: 0, online: false },
  { id: "c4", buyerName: "Nirmala R.", buyerInitial: "N", serviceName: "Business Cards Pack", lastMessage: "Can you use a different font for the name?", lastAt: new Date(Date.now() - 21600000), unread: 0, online: true },
  { id: "c5", buyerName: "Chamara B.", buyerInitial: "C", serviceName: "Modern Logo Design", lastMessage: "How many revision rounds are included?", lastAt: new Date(Date.now() - 86400000), unread: 0, online: false },
];

const MOCK_MESSAGES: Record<string, UIMessage[]> = {
  c1: [
    { id: "m1", from: "other", text: "Hi! I saw your logo design service on Needlyy.", sentAt: new Date(Date.now() - 1800000), read: true },
    { id: "m2", from: "me", text: "Hello! Thanks for reaching out. How can I help you?", sentAt: new Date(Date.now() - 1680000), read: true },
    { id: "m3", from: "other", text: "I need a logo for my bakery business. Modern and clean style.", sentAt: new Date(Date.now() - 1500000), read: true },
    { id: "m4", from: "me", text: "That sounds great! Could you share some color preferences and inspiration logos?", sentAt: new Date(Date.now() - 1200000), read: true },
    { id: "m5", from: "other", text: "Sure! I like warm tones — maybe cream and terracotta. I'll send some refs.", sentAt: new Date(Date.now() - 600000), read: true },
    { id: "m6", from: "other", text: "Can you deliver the logo in SVG format?", sentAt: new Date(Date.now() - 120000), read: false },
  ],
  c2: [
    { id: "m1", from: "other", text: "Hello, I need my AC serviced ASAP.", sentAt: new Date(Date.now() - 5400000), read: true },
    { id: "m2", from: "me", text: "Hi Asanka! I can arrange that. Which area are you in?", sentAt: new Date(Date.now() - 5100000), read: true },
    { id: "m3", from: "other", text: "Nugegoda. 2 units — split type.", sentAt: new Date(Date.now() - 4800000), read: true },
    { id: "m4", from: "other", text: "Is it available this Saturday at 10 AM?", sentAt: new Date(Date.now() - 3900000), read: false },
  ],
  c3: [
    { id: "m1", from: "other", text: "Hi, received the kit. Just going through it.", sentAt: new Date(Date.now() - 14400000), read: true },
    { id: "m2", from: "me", text: "Great! Let me know if you need any revisions.", sentAt: new Date(Date.now() - 12600000), read: true },
    { id: "m3", from: "other", text: "Perfect! The designs look amazing, thanks!", sentAt: new Date(Date.now() - 10800000), read: true },
  ],
  c4: [
    { id: "m1", from: "other", text: "Hi, I placed an order for business cards.", sentAt: new Date(Date.now() - 28800000), read: true },
    { id: "m2", from: "me", text: "Hello Nirmala! Got your order. I'll start on it today.", sentAt: new Date(Date.now() - 27000000), read: true },
    { id: "m3", from: "other", text: "Can you use a different font for the name? Something more elegant.", sentAt: new Date(Date.now() - 21600000), read: true },
  ],
  c5: [
    { id: "m1", from: "other", text: "Hello, I'm interested in your logo service.", sentAt: new Date(Date.now() - 90000000), read: true },
    { id: "m2", from: "other", text: "How many revision rounds are included?", sentAt: new Date(Date.now() - 86400000), read: true },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fsToUI(c: FSConversation, meRole: "seller"): UIConversation {
  return {
    id: c.id,
    buyerName: c.buyerName,
    buyerInitial: c.buyerInitial,
    serviceName: c.serviceName,
    lastMessage: c.lastMessage,
    lastAt: c.lastAt?.toDate?.() ?? new Date(),
    unread: c.unreadSeller ?? 0,
    online: c.buyerOnline ?? false,
  };
}

function fsMsgToUI(m: FSMessage, userId: string): UIMessage {
  return {
    id: m.id,
    from: m.senderId === userId ? "me" : "other",
    text: m.text,
    sentAt: m.sentAt?.toDate?.() ?? new Date(),
    read: m.read,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SellerInbox() {
  usePageTitle("Inbox");
  const user = getUser();
  const usingFirebase = isFirebaseConfigured && Boolean(user);

  // ── Conversation list state ──────────────────────────────────────────────────
  const [conversations, setConversations] = useState<UIConversation[]>(
    usingFirebase ? [] : MOCK_CONVERSATIONS
  );
  const [loadingConvos, setLoadingConvos] = useState(usingFirebase);

  // ── Active conversation + messages ───────────────────────────────────────────
  const [activeId, setActiveId] = useState<string | null>(
    usingFirebase ? null : MOCK_CONVERSATIONS[0]?.id ?? null
  );
  const [messages, setMessages] = useState<UIMessage[]>(
    usingFirebase ? [] : (MOCK_MESSAGES[MOCK_CONVERSATIONS[0]?.id] ?? [])
  );
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Firebase: subscribe to conversation list ─────────────────────────────────
  useEffect(() => {
    if (!usingFirebase || !user) return;
    const unsub = subscribeToConversations(user.id, (fsConvos) => {
      setConversations(fsConvos.map((c) => fsToUI(c, "seller")));
      setLoadingConvos(false);
    });
    return unsub;
  }, [usingFirebase, user?.id]);

  // ── Firebase: subscribe to active conversation messages ──────────────────────
  useEffect(() => {
    if (!usingFirebase || !activeId) return;
    setLoadingMsgs(true);
    const unsub = subscribeToMessages(activeId, (fsMsgs) => {
      setMessages(fsMsgs.map((m) => fsMsgToUI(m, user!.id)));
      setLoadingMsgs(false);
    });
    return unsub;
  }, [usingFirebase, activeId]);

  // ── Auto-scroll to latest message ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Open conversation ─────────────────────────────────────────────────────────
  const openConvo = useCallback(
    async (id: string) => {
      setActiveId(id);

      if (usingFirebase) {
        setMessages([]);
        await markMessagesRead(id, "seller");
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
        );
      } else {
        // Mock mode
        setMessages(MOCK_MESSAGES[id] ?? []);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, unread: 0 }
              : c
          )
        );
      }
    },
    [usingFirebase]
  );

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = draft.trim();
      if (!text || !activeId || sending) return;

      setSending(true);
      setDraft("");

      if (usingFirebase && user) {
        await fsSendMessage(activeId, {
          senderId: user.id,
          from: "seller",
          text,
          read: false,
        });
      } else {
        // Mock mode — append locally
        const newMsg: UIMessage = {
          id: `m${Date.now()}`,
          from: "me",
          text,
          sentAt: new Date(),
          read: true,
        };
        setMessages((prev) => [...prev, newMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, lastMessage: text, lastAt: new Date() }
              : c
          )
        );
      }
      setSending(false);
    },
    [draft, activeId, usingFirebase, user?.id, sending]
  );

  // ── Derived ────────────────────────────────────────────────────────────────────
  const filtered = conversations.filter(
    (c) =>
      c.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      c.serviceName.toLowerCase().includes(search.toLowerCase())
  );
  const activeConvo = conversations.find((c) => c.id === activeId);
  const unreadTotal = conversations.reduce((n, c) => n + c.unread, 0);

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Inbox
            {unreadTotal > 0 && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-black">
                {unreadTotal}
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            {conversations.length} conversations · {unreadTotal} unread
            {usingFirebase && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-soft overflow-hidden">
        <div className="flex h-[calc(100vh-280px)] min-h-[520px]">
          {/* ── Conversation list ─────────────────────────── */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full bg-slate-50 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loadingConvos ? (
                <div className="p-6 flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center mx-auto mb-3">
                    <i className="fas fa-comments text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
                  <p className="text-xs text-slate-400 mt-1">Buyers will message you when they're interested</p>
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openConvo(c.id)}
                    className={`w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 transition ${
                      activeId === c.id ? "bg-primary/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold text-base">
                        {c.buyerInitial}
                      </div>
                      {c.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm truncate ${c.unread > 0 ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                          {c.buyerName}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(c.lastAt)}</span>
                      </div>
                      <p className="text-[11px] text-primary font-semibold truncate mt-0.5">{c.serviceName}</p>
                      <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "font-semibold text-slate-800" : "text-slate-400"}`}>
                        {c.lastMessage}
                      </p>
                    </div>
                    {c.unread > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black grid place-items-center">
                        {c.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Message thread ────────────────────────────── */}
          {activeConvo ? (
            <div className="flex-1 flex flex-col min-w-0 hidden md:flex">
              {/* Thread header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold">
                    {activeConvo.buyerInitial}
                  </div>
                  {activeConvo.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900">{activeConvo.buyerName}</h3>
                  <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                    <i className="fas fa-tag text-primary text-[10px]" />
                    {activeConvo.serviceName}
                    <span className="text-slate-300">·</span>
                    <span className={activeConvo.online ? "text-emerald-500" : "text-slate-400"}>
                      {activeConvo.online ? "Online" : "Offline"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeConvo.buyerPhone ?? "+94771234567"}`}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-600 transition"
                    title="Call buyer"
                  >
                    <i className="fas fa-phone text-sm" />
                  </a>
                  <a
                    href={`https://wa.me/${(activeConvo.buyerPhone ?? "+94771234567").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 grid place-items-center text-emerald-600 transition"
                    title="WhatsApp"
                  >
                    <i className="fab fa-whatsapp text-sm" />
                  </a>
                  <Link
                    to="/dashboard/seller/orders"
                    className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 grid place-items-center text-primary transition"
                    title="View order"
                  >
                    <i className="fas fa-file-invoice text-sm" />
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loadingMsgs ? (
                  <div className="flex flex-col gap-3 pt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex items-end gap-2 animate-pulse ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className={`h-10 rounded-2xl bg-slate-100 ${i % 2 === 0 ? "w-48" : "w-64"}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.from === "me";
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground text-xs font-bold shrink-0">
                            {activeConvo.buyerInitial}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-gradient-brand text-primary-foreground rounded-br-md"
                              : "bg-slate-100 text-slate-800 rounded-bl-md"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 pb-1">
                          {timeAgo(msg.sentAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Compose */}
              <div className="px-4 pb-4 shrink-0">
                <form
                  onSubmit={sendMessage}
                  className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 bg-transparent text-sm focus:outline-none py-1 text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-xl hover:bg-slate-200 grid place-items-center text-slate-400 transition"
                      title="Attach file"
                    >
                      <i className="fas fa-paperclip text-sm" />
                    </button>
                    <button
                      type="submit"
                      disabled={!draft.trim() || sending}
                      className="w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground grid place-items-center shadow-glow hover:scale-105 transition disabled:opacity-40 disabled:scale-100"
                    >
                      {sending
                        ? <i className="fas fa-spinner fa-spin text-xs" />
                        : <i className="fas fa-paper-plane text-sm" />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center gap-4 p-8">
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 grid place-items-center">
                <i className="fas fa-comments text-primary text-3xl" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Select a conversation</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Choose a conversation from the left to start messaging with buyers.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
