
"use client";

import { ArrowUp, Paperclip } from "lucide-react";
import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage("");
  };

  return (
    <div className="chat-input-wrapper">
      <form
        className="chat-input-box"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="attachment-btn"
          title="File uploads coming soon"
          disabled
          aria-label="File uploads coming soon"
        >
          <Paperclip size={21} />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            disabled
              ? "IntelliChat is thinking..."
              : "Ask anything..."
          }
          disabled={disabled}
          aria-label="Your message"
        />

        <button
          type="submit"
          className="send-btn"
          disabled={disabled || !message.trim()}
          aria-label="Send message"
        >
          <ArrowUp size={21} />
        </button>
      </form>

      <p className="input-caption">
        IntelliChat can make mistakes. Verify important information.
      </p>
    </div>
  );
}
