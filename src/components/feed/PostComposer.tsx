import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import { MOCK_CATEGORIES } from "@/data/mock";

export default function PostComposer() {
  const user = getUser();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const initial = user?.name.charAt(0).toUpperCase() ?? null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newPost = {
        id: `user_${Date.now()}`,
        author: user?.name ?? "User",
        initial: initial ?? "U",
        role: "Individual Seller" as const,
        verified: false,
        location: user?.district ?? "Sri Lanka",
        category: category || "General",
        categoryIcon: "fas fa-tag",
        postedAt: new Date().toISOString(),
        title: title.trim(),
        description: desc.trim(),
        price: price ? parseInt(price) : undefined,
        priceType: "Negotiable" as const,
        tags: [],
        likes: 0,
        shares: 0,
        comments: [],
      };
      try {
        const existing = JSON.parse(localStorage.getItem("needly_feed_posts") ?? "[]");
        existing.unshift(newPost);
        localStorage.setItem("needly_feed_posts", JSON.stringify(existing));
        window.dispatchEvent(new Event("needly-feed-change"));
      } catch { /* ignore */ }
      toast.success("Post published! Buyers can now discover your service.");
      setSubmitting(false);
      setOpen(false);
      setTitle("");
      setDesc("");
      setCategory("");
      setPrice("");
    }, 900);
  };

  const handleOpen = () => setOpen(true);

  // ── Expanded compose form ────────────────────────────────────────────────
  if (open && user) {
    return (
      <div className="bg-card border border-border rounded-3xl p-5 shadow-soft">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold text-lg shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role} · {user.district}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-foreground/10 grid place-items-center text-muted-foreground transition shrink-0"
            aria-label="Close"
          >
            <i className="fas fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Service title (e.g. Professional Logo Design)"
            className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:font-normal placeholder:text-muted-foreground/60"
            required
            maxLength={80}
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe what you offer, your experience, and why buyers should choose you…"
            rows={3}
            className="w-full bg-muted rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
            required
            maxLength={400}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
              >
                <option value="">Category…</option>
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold pointer-events-none">Rs.</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                type="number"
                min={0}
                className="w-full bg-muted rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 [appearance:textfield]"
              />
            </div>
          </div>

          {/* Attachment bar + submit */}
          <div className="flex items-center gap-1 pt-1">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-foreground/5 text-xs font-semibold text-muted-foreground transition"
            >
              <i className="fas fa-image text-emerald-500" /> Photo
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-foreground/5 text-xs font-semibold text-muted-foreground transition"
            >
              <i className="fas fa-location-dot text-rose-500" /> Location
            </button>
            <div className="flex-1" />
            <button
              disabled={submitting || !title.trim() || !desc.trim()}
              className="bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-full text-sm font-bold shadow-glow hover:scale-105 transition disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
            >
              {submitting ? (
                <i className="fas fa-spinner fa-spin text-xs" />
              ) : (
                <i className="fas fa-paper-plane text-xs" />
              )}
              Post
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Collapsed / guest state ──────────────────────────────────────────────
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold text-lg shrink-0">
          {user ? initial : <i className="fas fa-user text-sm" />}
        </div>
        {user ? (
          <button
            onClick={handleOpen}
            className="flex-1 text-left px-5 py-3 rounded-full bg-muted text-muted-foreground hover:bg-foreground/5 transition text-sm"
          >
            Share a service you offer, {user.name.split(" ")[0]}…
          </button>
        ) : (
          <Link
            to="/login"
            className="flex-1 text-left px-5 py-3 rounded-full bg-muted text-muted-foreground hover:bg-foreground/5 transition text-sm"
          >
            Share a service you offer…
          </Link>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-border">
        {[
          { icon: "fa-image", color: "text-emerald-500", label: "Photo" },
          { icon: "fa-tag", color: "text-blue-500", label: "Service" },
          { icon: "fa-location-dot", color: "text-rose-500", label: "Location" },
        ].map((item) =>
          user ? (
            <button
              key={item.label}
              onClick={handleOpen}
              className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-foreground/5 text-sm font-semibold text-muted-foreground transition"
            >
              <i className={`fas ${item.icon} ${item.color}`} /> {item.label}
            </button>
          ) : (
            <Link
              key={item.label}
              to="/login"
              className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-foreground/5 text-sm font-semibold text-muted-foreground transition"
            >
              <i className={`fas ${item.icon} ${item.color}`} /> {item.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
