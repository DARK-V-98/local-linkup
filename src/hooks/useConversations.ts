import { useState, useEffect, useCallback } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as fsSendMessage,
  markMessagesRead,
  type FSConversation,
  type FSMessage,
} from "@/lib/firestore/conversations";
import { getUser } from "@/lib/auth";

/**
 * Real-time inbox hook.
 * - Provides conversation list (real-time Firestore when configured)
 * - Provides active-conversation messages (real-time subcollection)
 * - Falls back to empty state when Firebase is not configured (SellerInbox
 *   renders its own mock data in that case)
 */
export function useConversations() {
  const [conversations, setConversations] = useState<FSConversation[]>([]);
  const [messages, setMessages] = useState<FSMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

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
        const role = user.role === "seller" ? "seller" : "buyer";
        await markMessagesRead(id, role);
      }
    },
    [user?.role]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeId || !text.trim() || !user) return;

      if (!isFirebaseConfigured) return; // handled in SellerInbox via mock

      const role = user.role === "seller" ? "seller" : "buyer";
      await fsSendMessage(activeId, {
        senderId: user.id,
        from: role,
        text: text.trim(),
        read: false,
      });
    },
    [activeId, user?.id, user?.role]
  );

  const activeConversation = conversations.find((c) => c.id === activeId);
  const totalUnread = conversations.reduce(
    (n, c) =>
      n + (user?.role === "seller" ? c.unreadSeller : c.unreadBuyer),
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
