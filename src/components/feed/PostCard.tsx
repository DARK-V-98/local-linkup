import { useState } from "react";
import { FeedPost } from "@/data/feed";
import { formatPrice, timeAgo } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

interface Props {
  post: FeedPost;
}

export default function PostCard({ post }: Props) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState("");
  const [contactOpen, setContactOpen] = useState(false);

  const toggleLike = () => {
    setLiked((p) => !p);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  const onShare = async () => {
    const url = `${window.location.origin}/feed#${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Share it anywhere you like." });
      }
    } catch {
      /* user cancelled */
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((c) => [
      ...c,
      { id: `c${Date.now()}`, author: "You", initial: "Y", text, postedAt: new Date() },
    ]);
    setDraft("");
  };

  return (
    <article id={post.id} className="bg-card border border-border rounded-3xl shadow-soft overflow-hidden">
      {/* Header */}
      <header className="flex items-start justify-between p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold text-lg">
            {post.initial}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-foreground">{post.author}</h3>
              {post.verified && (
                <i className="fas fa-circle-check text-secondary text-sm" title="Verified seller" />
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <i className={`fas ${post.categoryIcon}`} /> {post.role}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <i className="fas fa-location-dot" /> {post.location}
              </span>
              <span>·</span>
              <span>{timeAgo(post.postedAt)}</span>
            </p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full hover:bg-foreground/5 grid place-items-center text-muted-foreground" aria-label="Post options">
          <i className="fas fa-ellipsis" />
        </button>
      </header>

      {/* Body */}
      <div className="px-5 pb-4">
        <h2 className="font-bold text-lg text-foreground mb-1">{post.title}</h2>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{post.description}</p>
        {post.tags.length > 0 && (
          <p className="mt-2 text-sm text-secondary font-semibold">{post.tags.join(" ")}</p>
        )}
      </div>

      {/* Service chip */}
      {post.price !== undefined && (
        <div className="mx-5 mb-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand grid place-items-center text-primary-foreground">
              <i className={`fas ${post.categoryIcon}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{post.category}</p>
              <p className="text-sm font-bold text-foreground">From {formatPrice(post.price)} <span className="text-xs font-medium text-muted-foreground">/ {post.priceType}</span></p>
            </div>
          </div>
          <button
            onClick={() => setContactOpen((o) => !o)}
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-glow hover:scale-105 transition"
          >
            <i className="fas fa-paper-plane" /> Contact
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="px-5 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground text-[10px]">
            <i className="fas fa-thumbs-up" />
          </span>
          {likes}
        </span>
        <span>
          {comments.length} comments · {post.shares} shares
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 mx-5 pt-2 border-t border-border grid grid-cols-4 gap-1">
        <button
          onClick={toggleLike}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-foreground/5 ${liked ? "text-primary" : "text-muted-foreground"}`}
        >
          <i className={`${liked ? "fas" : "far"} fa-thumbs-up`} />
          <span className="hidden xs:inline">Like</span>
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-foreground/5"
        >
          <i className="far fa-comment" />
          <span className="hidden xs:inline">Comment</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-foreground/5"
        >
          <i className="fas fa-share" />
          <span className="hidden xs:inline">Share</span>
        </button>
        <button
          onClick={() => setContactOpen((o) => !o)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5"
        >
          <i className="fas fa-paper-plane" />
          <span className="hidden xs:inline">Contact</span>
        </button>
      </div>

      {/* Contact panel */}
      {contactOpen && (
        <div className="mx-5 mt-3 rounded-2xl border border-border bg-muted/30 p-3 flex flex-wrap gap-2">
          {post.contactWhatsapp && (
            <a
              href={`https://wa.me/${post.contactWhatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:opacity-90"
            >
              <i className="fab fa-whatsapp" /> WhatsApp
            </a>
          )}
          {post.contactPhone && (
            <a
              href={`tel:${post.contactPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:opacity-90"
            >
              <i className="fas fa-phone" /> Call
            </a>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 text-foreground text-sm font-semibold hover:bg-foreground/10">
            <i className="far fa-envelope" /> Message
          </button>
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <div className="mx-5 my-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-muted grid place-items-center font-bold text-foreground/70 text-sm">
                {c.initial}
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <p className="text-xs font-bold text-foreground">{c.author}</p>
                  <p className="text-sm text-foreground/90">{c.text}</p>
                </div>
                <div className="px-3 mt-1 text-[11px] text-muted-foreground flex gap-3">
                  <button className="hover:text-foreground">Like</button>
                  <button className="hover:text-foreground">Reply</button>
                  <span>{timeAgo(c.postedAt)}</span>
                </div>
              </div>
            </div>
          ))}

          <form onSubmit={submitComment} className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground text-sm font-bold">
              <i className="fas fa-user text-xs" />
            </div>
            <div className="flex-1 relative">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a comment…"
                className="w-full bg-muted rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full grid place-items-center text-primary hover:bg-primary/10"
                aria-label="Send comment"
              >
                <i className="fas fa-paper-plane text-sm" />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
