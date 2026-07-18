import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/lib/usePageTitle";
import AppShell from "@/components/layout/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";
import { SL_DISTRICTS } from "@/data/catalog";
import { useCategories } from "@/hooks/useCategories";
import { useJobRequests } from "@/hooks/useJobRequests";
import { addJobRequest } from "@/lib/firestore/jobRequests";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";


const URGENCY_LABELS = { flexible: "Flexible", this_week: "This Week", urgent: "Urgent" };
const URGENCY_STYLE = {
  flexible: "bg-slate-100 text-slate-600",
  this_week: "bg-blue-50 text-blue-600",
  urgent: "bg-rose-50 text-rose-600",
};


export default function PostRequest() {
  usePageTitle("Post a Job — Get Quotes from Local Pros");
  const { categories } = useCategories();
  const [view, setView] = useState<"browse" | "post">("browse");
  const { requests: posts, loading: postsLoading } = useJobRequests();
  const [filterCat, setFilterCat] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState<"all" | "flexible" | "this_week" | "urgent">("all");
  const [filterDistrict, setFilterDistrict] = useState("all");

  const [form, setForm] = useState({
    title: "", category: "", description: "", budget: "",
    budgetMax: "", district: "", urgency: "flexible" as "flexible" | "this_week" | "urgent",
    name: "", phone: "", email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredPosts = posts.filter((p) => {
    if (filterCat !== "all" && p.category !== filterCat) return false;
    if (filterUrgency !== "all" && p.urgency !== filterUrgency) return false;
    if (filterDistrict !== "all" && p.district !== filterDistrict) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description || !form.name || !form.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.description.length < 30) {
      toast.error("Description should be at least 30 characters.");
      return;
    }
    if (!isFirebaseConfigured) {
      toast.error("Posting is unavailable right now. Please try again later.");
      return;
    }

    setSubmitting(true);
    const user = getUser();
    const budget = form.budgetMax
      ? `Rs. ${Number(form.budget || 0).toLocaleString()} – ${Number(form.budgetMax).toLocaleString()}`
      : form.budget
        ? `Rs. ${Number(form.budget).toLocaleString()}`
        : "Negotiable";

    try {
      await addJobRequest({
        title: form.title.trim(),
        category: form.category,
        categoryIcon: categories.find((c) => c.name === form.category)?.icon ?? "fa-tag",
        description: form.description.trim(),
        budget,
        district: form.district || "Colombo",
        urgency: form.urgency,
        ...(user ? { authorId: user.id } : {}),
        authorName: form.name.trim(),
        phone: form.phone.trim(),
        verified: Boolean(user?.verified),
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell fullBleed>
      <div className="pb-10">

        {/* Hero */}
        <section className="bg-gradient-to-b from-background to-slate-50 border-b border-border py-14">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-xs font-bold text-primary mb-3">
                  <i className="fas fa-bullhorn" /> Job Board
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Post a request,<br />
                  <span className="text-gradient-brand">get quotes from pros.</span>
                </h1>
                <p className="mt-3 text-muted-foreground max-w-xl">
                  Describe what you need. Verified local professionals will send you their best quotes — no searching required.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setView("browse")}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition ${view === "browse" ? "bg-foreground text-background" : "bg-background border border-border hover:bg-foreground/5"}`}
                >
                  <i className="fas fa-list mr-2" /> Browse Requests
                </button>
                <button
                  onClick={() => setView("post")}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm transition ${view === "post" ? "bg-gradient-brand text-primary-foreground shadow-glow" : "bg-background border border-border hover:bg-foreground/5"}`}
                >
                  <i className="fas fa-plus mr-2" /> Post a Request
                </button>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 mt-8">
              {[
                { icon: "fa-file-circle-plus", val: "1,240+", label: "Requests Posted" },
                { icon: "fa-user-tie", val: "380+", label: "Active Pros" },
                { icon: "fa-clock", val: "< 2 hrs", label: "Avg. First Quote" },
                { icon: "fa-star", val: "4.8 / 5", label: "Avg. Satisfaction" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
                    <i className={`fas ${s.icon} text-sm`} />
                  </span>
                  <div>
                    <div className="font-black text-foreground text-sm leading-none">{s.val}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browse view */}
        {view === "browse" && (
          <section className="container mx-auto px-4 py-10">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Districts</option>
                {SL_DISTRICTS.filter((d) => d !== "Online").map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="flex gap-2">
                {(["all", "urgent", "this_week", "flexible"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setFilterUrgency(u)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filterUrgency === u ? "bg-foreground text-background" : "bg-background border border-border hover:bg-foreground/5"}`}
                  >
                    {u === "all" ? "All" : URGENCY_LABELS[u]}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-sm text-muted-foreground font-semibold self-center">{filteredPosts.length} requests</span>
            </div>

            {/* Post cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-card border border-border rounded-3xl p-6 hover:-translate-y-0.5 hover:shadow-glass transition">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                      <i className={`fas ${post.categoryIcon} text-sm`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-foreground text-sm leading-tight line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-muted-foreground">{post.category}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-[10px] font-bold text-muted-foreground">{post.district}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">{post.description}</p>

                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-xs font-black text-foreground bg-foreground/5 px-3 py-1 rounded-full">
                      <i className="fas fa-coins mr-1 text-primary" />{post.budget}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${URGENCY_STYLE[post.urgency]}`}>
                      {post.urgency === "urgent" && <i className="fas fa-bolt mr-1" />}
                      {URGENCY_LABELS[post.urgency]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-brand text-primary-foreground grid place-items-center text-xs font-black">
                        {post.name[0]}
                      </span>
                      <span className="text-xs font-bold text-foreground">{post.name}</span>
                      {post.verified && <i className="fas fa-circle-check text-primary text-xs" />}
                      <span className="text-[10px] text-muted-foreground">· {timeAgo(post.postedAt)}</span>
                    </div>
                    <button
                      onClick={() => toast.success("Quote sent! The buyer will be notified.")}
                      className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition"
                    >
                      <i className="fas fa-paper-plane mr-1" /> Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {postsLoading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-foreground/5 animate-pulse" />
                ))}
              </div>
            )}

            {!postsLoading && filteredPosts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <i className="fas fa-inbox text-4xl mb-4 block opacity-30" />
                <div className="font-bold text-lg">
                  {posts.length === 0 ? "No job requests posted yet" : "No requests match your filters"}
                </div>
                {posts.length === 0 ? (
                  <button onClick={() => setView("post")} className="mt-4 text-sm font-bold text-primary hover:underline">Post the first one</button>
                ) : (
                  <button onClick={() => { setFilterCat("all"); setFilterUrgency("all"); setFilterDistrict("all"); }} className="mt-4 text-sm font-bold text-primary hover:underline">Clear filters</button>
                )}
              </div>
            )}

            <div className="text-center mt-12">
              <button
                onClick={() => setView("post")}
                className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-glow hover:scale-105 transition"
              >
                <i className="fas fa-plus" /> Post Your Own Request
              </button>
              <p className="mt-3 text-xs text-muted-foreground">Free to post · Quotes arrive within hours · No obligation</p>
            </div>
          </section>
        )}

        {/* Post form view */}
        {view === "post" && !submitted && (
          <section className="container mx-auto px-4 py-12 max-w-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-black">Describe your job</h2>
              <p className="text-muted-foreground mt-1">The more detail you give, the better quotes you'll receive.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Job Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Need a plumber for bathroom leak repair"
                  className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">District *</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select district</option>
                    {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">Description * <span className="text-muted-foreground/60 font-normal">(min 30 characters)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the job in detail — what needs to be done, any specific requirements, location access, etc."
                  rows={5}
                  className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="text-right text-[10px] text-muted-foreground mt-1">{form.description.length} / 500</div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Budget Min (Rs.)</label>
                  <input
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g. 5000"
                    type="number"
                    className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Budget Max (Rs.)</label>
                  <input
                    value={form.budgetMax}
                    onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                    placeholder="e.g. 15000"
                    type="number"
                    className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">Urgency</label>
                <div className="flex gap-3 mt-2">
                  {(["flexible", "this_week", "urgent"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setForm({ ...form, urgency: u })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${form.urgency === u ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:bg-foreground/5"}`}
                    >
                      {u === "urgent" && <i className="fas fa-bolt mr-1" />}
                      {URGENCY_LABELS[u]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="text-sm font-black mb-4">Your Contact Details</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Your Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name"
                      className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">WhatsApp / Phone *</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
                <i className="fas fa-shield-halved text-primary mt-0.5" />
                <p className="text-xs text-foreground/80">
                  Your contact details are only shared with pros who send you a quote. Needlyy never sells your data.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-brand text-primary-foreground py-4 rounded-2xl font-bold shadow-glow hover:scale-[1.02] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? <><i className="fas fa-spinner fa-spin" /> Posting...</> : <><i className="fas fa-rocket" /> Post My Request</>}
              </button>

              <p className="text-center text-xs text-muted-foreground">Free to post · No obligation to accept any quote</p>
            </form>
          </section>
        )}

        {/* Success state */}
        {view === "post" && submitted && (
          <section className="container mx-auto px-4 py-20 max-w-xl text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-6">
              <i className="fas fa-circle-check text-emerald-500 text-4xl" />
            </div>
            <h2 className="text-3xl font-black mb-3">Request Posted!</h2>
            <p className="text-muted-foreground mb-8">
              Your job request is now live. Verified professionals in <strong>{form.district}</strong> will see it and send their quotes. You'll receive them via WhatsApp.
            </p>
            <div className="bg-card border border-border rounded-3xl p-6 text-left mb-8 space-y-3">
              {[
                { icon: "fa-bell", text: "Pros will send quotes to your WhatsApp within hours" },
                { icon: "fa-shield-halved", text: "Only Needlyy-verified sellers can respond" },
                { icon: "fa-hand-shake", text: "You choose who to hire — no pressure" },
                { icon: "fa-star", text: "After the job, leave a review to help the community" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm">
                  <i className={`fas ${item.icon} text-primary w-5 text-center`} />
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setView("browse"); setSubmitted(false); }} className="px-6 py-3 rounded-2xl border border-border font-bold text-sm hover:bg-foreground/5 transition">
                Browse Other Requests
              </button>
              <Link to="/browse" className="px-6 py-3 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm shadow-glow hover:scale-105 transition">
                Browse Services
              </Link>
            </div>
          </section>
        )}

      </div>
      <WhatsAppButton />
    </AppShell>
  );
}
