
/* =========================================
   INTELLICHAT - CHAT STORAGE
========================================= */

// =========================================
// TYPES
// =========================================

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type ChatGroup =
  | "Today"
  | "Yesterday"
  | "Previous 7 Days"
  | "Older";

// =========================================
// LOCAL STORAGE KEY
// =========================================

const STORAGE_KEY = "intellichat_conversations";

// =========================================
// GET SAVED CHATS
// =========================================

export function getChats(): Chat[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (chat): chat is Chat =>
        chat !== null &&
        typeof chat === "object" &&
        typeof chat.id === "string" &&
        typeof chat.title === "string" &&
        Array.isArray(chat.messages) &&
        typeof chat.createdAt === "string" &&
        typeof chat.updatedAt === "string"
    );
  } catch (error) {
    console.error("Unable to load chats:", error);
    return [];
  }
}

// =========================================
// SAVE CHATS
// =========================================

export function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(chats)
    );
  } catch (error) {
    console.error("Unable to save chats:", error);
  }
}

// =========================================
// CREATE NEW CHAT
// =========================================

export function createChat(): Chat {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

// =========================================
// GENERATE CHAT TITLE
// =========================================

export function generateChatTitle(
  message: string
): string {
  const title = message
    .trim()
    .replace(/\s+/g, " ");

  return title.length > 35
    ? title.substring(0, 35) + "..."
    : title || "New Chat";
}

// =========================================
// UPDATE OR ADD CHAT
// =========================================

export function updateChat(
  chats: Chat[],
  updatedChat: Chat
): Chat[] {
  const exists = chats.some(
    (chat) => chat.id === updatedChat.id
  );

  const result = exists
    ? chats.map((chat) =>
        chat.id === updatedChat.id
          ? updatedChat
          : chat
      )
    : [updatedChat, ...chats];

  return result.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
  );
}

// =========================================
// DELETE CHAT
// =========================================

export function deleteChat(
  chats: Chat[],
  chatId: string
): Chat[] {
  return chats.filter(
    (chat) => chat.id !== chatId
  );
}

// =========================================
// RENAME CHAT
// =========================================

export function renameChat(
  chats: Chat[],
  chatId: string,
  newTitle: string
): Chat[] {
  const title = newTitle
    .trim()
    .slice(0, 80);

  if (!title) {
    return chats;
  }

  return chats
    .map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            title,
            updatedAt: new Date().toISOString(),
          }
        : chat
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );
}

// =========================================
// SEARCH CHATS
// =========================================

export function searchChats(
  chats: Chat[],
  query: string
): Chat[] {
  const normalized = query
    .trim()
    .toLowerCase();

  if (!normalized) {
    return chats;
  }

  return chats.filter((chat) => {
    // Search conversation titles
    const matchesTitle = chat.title
      .toLowerCase()
      .includes(normalized);

    // Search message content
    const matchesMessages = chat.messages.some(
      (message) =>
        message.content
          .toLowerCase()
          .includes(normalized)
    );

    return matchesTitle || matchesMessages;
  });
}

// =========================================
// GROUP CHATS BY DATE
// =========================================

export function getChatGroup(
  dateString: string
): ChatGroup {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Older";
  }

  const now = new Date();

  // Start of today
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Start of yesterday
  const startOfYesterday = new Date(
    startOfToday
  );

  startOfYesterday.setDate(
    startOfYesterday.getDate() - 1
  );

  // Start of previous 7 days
  const startOfSevenDaysAgo = new Date(
    startOfToday
  );

  startOfSevenDaysAgo.setDate(
    startOfSevenDaysAgo.getDate() - 7
  );

  if (date >= startOfToday) {
    return "Today";
  }

  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  if (date >= startOfSevenDaysAgo) {
    return "Previous 7 Days";
  }

  return "Older";
}
