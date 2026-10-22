import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import PostComposer from "@/components/feed/PostComposer";
import PostCard from "@/components/feed/PostCard";
import { useCategories } from "@/hooks/useCategories";
import { useFeed } from "@/hooks/useFeed";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Feed() {
  const { categories } = useCategories();
  const { posts: allPosts, loading } = useFeed();
  usePageTitle("Service Feed");
  const [filter, setFilter] = useState<string>("All");

  const posts = useMemo(() => {
    if (filter === "All") return allPosts;
    return allPosts.filter((p) => p.category === filter);
  }, [filter, allPosts]);

  const filters = ["All", ...categories.slice(0, 6).map((c) => c.name)];

  return (
    <AppShell fullBleed>
      <div className="feed-page">
        {/* Page heading */}
        <header className="feed-page-heading">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
            <i className="fas fa-bolt" /> Live Feed
          </span>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-foreground">
            What sellers are <span className="text-gradient-brand">offering today</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover local skills, share your work, and make a connection.
          </p>
        </header>

        <div className="feed-layout">
          {/* Left rail */}
          <aside className="hidden lg:block space-y-4">
            <div className="bg-card border border-border rounded-3xl p-4 shadow-soft feed-sticky">
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
            <div className="feed-filters lg:hidden">
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

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 rounded-3xl bg-foreground/5 animate-pulse" />
              ))
            ) : posts.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
                <i className="fas fa-inbox text-3xl mb-3 block" />
                {filter === "All"
                  ? "No posts yet — be the first to share something."
                  : "No posts in this category yet."}
              </div>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </section>

          {/* Useful discovery links instead of fabricated rankings and follow buttons. */}
          <aside className="hidden xl:block">
            <div className="bg-card border border-border rounded-3xl p-5 feed-sticky space-y-4">
              <h2 className="font-bold text-lg">Make a connection</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Find a local professional for your next project, or explore a stay built around you.</p>
              <Link to="/browse" className="business-secondary w-full">Explore services</Link>
              <Link to="/hotels" className="business-secondary w-full">Hotels & stays</Link>
              <Link to="/post-request" className="text-sm font-bold text-primary block py-3">Tell sellers what you need →</Link>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
