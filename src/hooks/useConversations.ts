import { getUser } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
sendMessage as fsSendMessage,
markMessagesRead,
subscribeToConversations,
subscribeToMessages,
type FSConversation,
type FSMessage,
} from "@/lib/firestore/conversations";
import { useCallback,useEffect,useState } from "react";

/**
 * Real-time inbox hook.
 * - Provides conversation list (real-time Firestore when configured)
 * - Provides active-conversation messages (real-time subcollection)
 * - Requires Firebase for message delivery.
 */
export function useConversations(perspective?: "buyer" | "seller") {
  const [conversations, setConversations] = useState<FSConversation[]>([]);
  const [messages, setMessages] = useState<FSMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const role = perspective ?? (user?.role === "seller" ? "seller" : "buyer");

  // ── Subscribe to conversation list ────────────────────────────────────────
  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToConversations(user.id, (convos) => {
      setConversations(convos);
      setLoading(false);
    });
    return unsub;
  }, [user?.id]);

  // ── Subscribe to active conversation messages ─────────────────────────────
  useEffect(() => {
    if (!activeId || !isFirebaseConfigured) return;

    const unsub = subscribeToMessages(activeId, (msgs) => {
      setMessages(msgs);
    });
    return unsub;
  }, [activeId]);

  const openConversation = useCallback(
    async (id: string) => {
      setActiveId(id);
      setMessages([]);
      if (isFirebaseConfigured && user) {
        await markMessagesRead(id, role);
      }
    },
    [user?.id, role]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeId || !text.trim() || !user) return;

      if (!isFirebaseConfigured) throw new Error("Messaging requires a database connection.");

      await fsSendMessage(activeId, {
        senderId: user.id,
        from: role,
        text: text.trim(),
        read: false,
      });
    },
    [activeId, user?.id, role]
  );

  const activeConversation = conversations.find((c) => c.id === activeId);
  const totalUnread = conversations.reduce(
    (n, c) =>
      n + (role === "seller" ? c.unreadSeller : c.unreadBuyer),
    0
  );

  return {
    conversations,
    messages,
    activeId,
    activeConversation,
    totalUnread,
    loading,
    openConversation,
    sendMessage,
  };
}
