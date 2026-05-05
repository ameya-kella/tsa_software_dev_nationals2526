import { useEffect, useState } from "react";

export type ChatMsg = {
  id: string;
  sender: "deaf" | "hearing";
  text: string;
  ts: number;
};

const API_BASE = "http://localhost:8000";

export function useConversationSession(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);

  // load from server only
  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/messages/session/${sessionId}`
        );
        const data = await res.json();
        setMessages(data || []);
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  const addMessage = async (msg: ChatMsg) => {
    if (!sessionId) return;

    setMessages((prev) => [...prev, msg]);

    try {
      await fetch(`${API_BASE}/append_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: msg,
        }),
      });
    } catch (e) {
      console.error("Failed to sync message", e);
    }
  };

  const setAllMessages = (msgs: ChatMsg[]) => {
    setMessages(msgs);
  };

  return {
    messages,
    addMessage,
    setAllMessages,
    loading,
  };
}