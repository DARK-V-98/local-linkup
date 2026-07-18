import { useState, useEffect } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToFeed, type FSPost } from "@/lib/firestore/feed";
import { tsToIso } from "@/lib/firestore/normalize";
import type { FeedPost } from "@/data/feed";

/** Locally composed posts, used when Firebase is unconfigured. */
function getStoredPosts(): FeedPost[] {
  try {
    const raw = JSON.parse(localStorage.getItem("needly_feed_posts") ?? "[]");
    return raw.map((p: FeedPost & { postedAt: string }) => ({
      ...p,
      postedAt: new Date(p.postedAt),
    }));
  } catch {
    return [];
  }
}

/** Live community feed, newest first. */
export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const refresh = () => {
        setPosts(getStoredPosts());
        setLoading(false);
      };
      refresh();
      window.addEventListener("needly-feed-change", refresh);
      return () => window.removeEventListener("needly-feed-change", refresh);
    }

    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) setLoading(false);
    }, 5000);

    const unsub = subscribeToFeed((docs) => {
      settled = true;
      setPosts(docs.map(toFeedPost));
      setLoading(false);
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  return { posts, loading };
}

function toFeedPost(p: FSPost): FeedPost {
  return {
    id: p.id,
    author: p.authorName,
    initial: p.authorInitial || p.authorName.charAt(0).toUpperCase(),
    role: p.authorRole === "seller" ? "Individual Seller" : "Business",
    verified: false,
    location: "",
    category: p.category,
    categoryIcon: "fa-tag",
    postedAt: new Date(tsToIso(p.createdAt)),
    title: p.title,
    description: p.description,
    price: p.price,
    image: p.imageUrl,
    tags: [],
    likes: p.likes ?? 0,
    shares: p.shares ?? 0,
    // Comment bodies live in a subcollection; the card only needs the count
    // until a post is expanded.
    comments: [],
  };
}
