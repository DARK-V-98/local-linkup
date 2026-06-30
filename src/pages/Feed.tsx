import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { MOCK_FEED_POSTS, FeedPost } from "@/data/feed";
import { MOCK_CATEGORIES } from "@/data/mock";
import { usePageTitle } from "@/lib/usePageTitle";

function getStoredPosts(): FeedPost[] {
  try {
    const raw = JSON.parse(localStorage.getItem("needly_feed_posts") ?? "[]");
    return raw.map((p: FeedPost & { postedAt: string }) => ({ ...p, postedAt: new Date(p.postedAt) }));
  } catch { return []; }
}

export default function Feed() {
  usePageTitle("Service Feed");
  const [filter, setFilter] = useState<string>("All");
  const [userPosts, setUserPosts] = useState<FeedPost[]>(getStoredPosts);

  useEffect(() => {
    const refresh = () => setUserPosts(getStoredPosts());
    window.addEventListener("needly-feed-change", refresh);
    return () => window.removeEventListener("needly-feed-change", refresh);
  }, []);

  const allPosts = useMemo(() => [...userPosts, ...MOCK_FEED_POSTS], [userPosts]);

  const posts = useMemo(() => {
    if (filter === "All") return allPosts;
    return allPosts.filter((p) => p.category === filter);
  }, [filter, allPosts]);

  const filters = ["All", ...MOCK_CATEGORIES.slice(0, 6).map((c) => c.name)];

  return (
    <AppShell fullBleed>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-10">
        {/* Page heading */}
        <header className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
            <i className="fas fa-bolt" /> Live Feed
          </span>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-foreground">
            What sellers are <span className="text-gradient-brand">offering today</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Scroll, like, and reach out — Facebook-style discovery for Sri Lanka's services.
          </p>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr_280px] gap-6 max-w-6xl mx-auto">
          {/* Left rail */}
          <aside className="hidden lg:block space-y-4">
            <div className="bg-card border border-border rounded-3xl p-4 shadow-soft sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Browse</p>
              <nav className="flex flex-col gap-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                      filter === f
                        ? "bg-gradient-brand text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <i className={`fas ${f === "All" ? "fa-globe" : "fa-tag"} w-4`} />
                    {f}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Feed */}
          <section className="space-y-4 min-w-0">
            <PostComposer />

            {/* Mobile filter strip */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition ${
                      filter === f
                        ? "bg-gradient-brand text-primary-foreground shadow-glow"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
                <i className="fas fa-inbox text-3xl mb-3 block" />
                No posts in this category yet.
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </section>

          {/* Right rail */}
          <aside className="hidden lg:block space-y-4">
            <div className="bg-card border border-border rounded-3xl p-5 shadow-soft sticky top-24">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <i className="fas fa-fire text-orange-500" /> Trending tags
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {["#colombo", "#wedding", "#tuition", "#delivery", "#cleaning", "#webdesign", "#kandy"].map((t) => (
                  <span key={t} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-foreground/80 hover:bg-foreground/10 cursor-pointer">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-border">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <i className="fas fa-star text-amber-500" /> Top sellers
                </h4>
                <ul className="mt-3 space-y-3">
                  {["Tharindu P.", "Nirmala S.", "Kasun J."].map((s, i) => (
                    <li key={s} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold text-sm">
                        {s[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{s}</p>
                        <p className="text-xs text-muted-foreground">{120 - i * 20} services sold</p>
                      </div>
                      <button className="text-xs font-bold text-primary hover:underline">Follow</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
