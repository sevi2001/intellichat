
"use client";

import { useRef, useState } from "react";
import { Bell, Sparkles, LoaderCircle } from "lucide-react";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInput from "./components/ChatInput";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesRef = useRef<Message[]>([]);
  const busyRef = useRef(false);
  const conversationRef = useRef(0);

  const handleSend = async (content: string) => {
    if (!content.trim() || busyRef.current) return;

    busyRef.current = true;
    const conversationId = conversationRef.current;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
    };

    const updatedMessages = [
      ...messagesRef.current,
      userMessage,
    ];

    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((message) => !message.content.startsWith(
              "Sorry, I couldn't generate a response."
            ))
            .slice(-30)
            .map(({ role, content }) => ({
              role,
              content,
            })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      if (conversationId !== conversationRef.current) return;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };

      messagesRef.current = [
        ...messagesRef.current,
        assistantMessage,
      ];
      setMessages(messagesRef.current);
    } catch (err) {
      if (conversationId !== conversationRef.current) return;

      console.error("Chat error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      if (conversationId === conversationRef.current) {
        setLoading(false);
        busyRef.current = false;
      }
    }
  };

  const handleNewChat = () => {
    conversationRef.current += 1;
    busyRef.current = false;
    messagesRef.current = [];
    setMessages([]);
    setError("");
    setLoading(false);
  };

  return (
    <div className="app-layout">
      <Sidebar onNewChat={handleNewChat} />

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <Sparkles size={19} />
            <span>AI Workspace</span>
          </div>

          <div className="topbar-actions">
            <button
              className="notification-btn"
              title="Notifications coming soon"
              disabled
              aria-label="Notifications coming soon"
            >
              <Bell size={20} />
            </button>
            <div className="user-avatar">U</div>
          </div>
        </header>

        <div className="content-area">
          {messages.length === 0 ? (
            <WelcomeScreen onPrompt={handleSend} />
          ) : (
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role}`}
                >
                  {message.role === "assistant" && (
                    <div className="assistant-avatar">
                      <Sparkles size={18} />
                    </div>
                  )}

                  <div className="message-bubble">
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="assistant-avatar">
                    <Sparkles size={18} />
                  </div>
                  <div className="message-bubble typing-indicator">
                    <LoaderCircle
                      size={19}
                      className="loading-spinner"
                    />
                    IntelliChat is thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="chat-error" role="alert">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={loading}
        />
      </main>
    </div>
  );
}
