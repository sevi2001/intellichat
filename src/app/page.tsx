
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Bell, Sparkles } from "lucide-react";

import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInput from "./components/ChatInput";
import MarkdownMessage from "./components/MarkdownMessage";

import {
  createChat,
  deleteChat,
  generateChatTitle,
  getChats,
  saveChats,
  updateChat,
} from "./lib/chatStorage";

import type {
  Chat,
  Message,
} from "./lib/chatStorage";

export default function Home() {
  // =====================================
  // STATES
  // =====================================

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  // =====================================
  // REFS
  // =====================================

  const chatsRef = useRef<Chat[]>([]);
  const activeChatIdRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  // =====================================
  // CHAT STATE HELPERS
  // =====================================

  const setActiveChat = useCallback(
    (id: string | null) => {
      activeChatIdRef.current = id;
      setActiveChatId(id);
    },
    []
  );

  const persistChats = useCallback(
    (nextChats: Chat[]) => {
      chatsRef.current = nextChats;
      setChats(nextChats);
      saveChats(nextChats);
    },
    []
  );

  // =====================================
  // LOAD SAVED CONVERSATIONS
  // =====================================

  useEffect(() => {
    const storedChats = getChats();

    chatsRef.current = storedChats;

    queueMicrotask(() => {
      setChats(storedChats);
      setInitialized(true);
    });

    return () => {
      requestRef.current?.abort();
    };
  }, []);

  // =====================================
  // ACTIVE CONVERSATION
  // =====================================

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId
    ) ?? null;

  const messages = activeChat?.messages ?? [];

  // =====================================
  // CANCEL ACTIVE REQUEST
  // =====================================

  function cancelCurrentRequest() {
    requestRef.current?.abort();
    requestRef.current = null;

    busyRef.current = false;

    setLoading(false);
    setError("");
  }

  // =====================================
  // NEW CHAT
  // =====================================

  function handleNewChat() {
    cancelCurrentRequest();
    setActiveChat(null);
  }

  // =====================================
  // OPEN SAVED CHAT
  // =====================================

  function handleSelectChat(id: string) {
    const exists = chatsRef.current.some(
      (chat) => chat.id === id
    );

    if (!exists) return;

    cancelCurrentRequest();
    setActiveChat(id);
  }

  // =====================================
  // DELETE SAVED CHAT
  // =====================================

  function handleDeleteChat(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    if (activeChatIdRef.current === id) {
      cancelCurrentRequest();
      setActiveChat(null);
    }

    const remainingChats = deleteChat(
      chatsRef.current,
      id
    );

    persistChats(remainingChats);
  }

  // =====================================
  // SEND MESSAGE TO GEMINI
  // =====================================

  async function handleSend(text: string) {
    const content = text.trim();

    if (
      !content ||
      busyRef.current ||
      !initialized
    ) {
      return;
    }

    busyRef.current = true;
    setLoading(true);
    setError("");

    // Find the active chat.
    let chat = chatsRef.current.find(
      (item) =>
        item.id === activeChatIdRef.current
    );

    // Create a new chat if needed.
    if (!chat) {
      chat = createChat();
      chat.title = generateChatTitle(content);

      setActiveChat(chat.id);
    }

    const chatId = chat.id;

    // Add the user's message.
    const userMessage: Message = {
      role: "user",
      content,
    };

    const updatedChat: Chat = {
      ...chat,
      messages: [
        ...chat.messages,
        userMessage,
      ],
      updatedAt: new Date().toISOString(),
    };

    // Save immediately.
    persistChats(
      updateChat(
        chatsRef.current,
        updatedChat
      )
    );

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      // Call your existing Gemini API route.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedChat.messages,
        }),
        signal: controller.signal,
      });

      const data: {
        reply?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to generate a response."
        );
      }

      if (!data.reply?.trim()) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      // Ignore responses from canceled requests.
      if (
        controller.signal.aborted ||
        activeChatIdRef.current !== chatId
      ) {
        return;
      }

      const latestChat =
        chatsRef.current.find(
          (item) => item.id === chatId
        );

      if (!latestChat) return;

      // Add Gemini's response.
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply.trim(),
      };

      const completedChat: Chat = {
        ...latestChat,
        messages: [
          ...latestChat.messages,
          assistantMessage,
        ],
        updatedAt: new Date().toISOString(),
      };

      // Save the completed conversation.
      persistChats(
        updateChat(
          chatsRef.current,
          completedChat
        )
      );
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(message);
      console.error("Chat error:", err);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        busyRef.current = false;
        setLoading(false);
      }
    }
  }

  // =====================================
  // USER INTERFACE
  // =====================================

  return (
    <div className="app-shell">
      {/* GREEN SIDEBAR */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* MAIN DASHBOARD */}
      <main className="main-content">
        <div className="chat-page">

          {/* AI WORKSPACE HEADER */}
          <header className="topbar">
            <div className="topbar-title">
              <Sparkles size={21} />
              <span>AI Workspace</span>
            </div>

            <div className="topbar-actions">
              <Bell
                size={20}
                className="notification-btn"
              />

              <div className="user-avatar">
                U
              </div>
            </div>
          </header>

          {/* WELCOME SCREEN OR CHAT */}
          {!initialized ? (
            <div className="content-area">
              <div className="chat-loading">
                Loading conversations...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="content-area">
              <WelcomeScreen
                onPrompt={handleSend}
              />
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map(
                (message, index) => (
                  <div
                    key={`${activeChatId}-${index}`}
                    className={`message ${
                      message.role === "user"
                        ? "user-message"
                        : "assistant-message"
                    }`}
                  >
                    <div className="message-avatar">
                      {message.role === "user"
                        ? "You"
                        : "AI"}
                    </div>

                    <div className="message-content">
  {message.role === "assistant" ? (
    <MarkdownMessage content={message.content} />
  ) : (
    message.content
  )}
</div>
                  </div>
                )
              )}

              {/* AI THINKING INDICATOR */}
              {loading && (
                <div className="typing-indicator">
                  <span className="loading-spinner" />
                  IntelliChat is thinking...
                </div>
              )}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div
              className="chat-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* FIXED BOTTOM CHAT INPUT */}
          <ChatInput
            onSend={handleSend}
            disabled={
              loading || !initialized
            }
          />
        </div>
      </main>
    </div>
  );
}
