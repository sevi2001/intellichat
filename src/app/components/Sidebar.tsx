
"use client";

import {
  BookOpen,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

type SidebarProps = {
  onNewChat: () => void;
};

export default function Sidebar({ onNewChat }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const menu = [
    { icon: Home, label: "Home" },
    { icon: MessageCircle, label: "My Chats" },
    { icon: FileText, label: "Documents" },
    { icon: GraduationCap, label: "Study Tools" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <button
        className="mobile-menu"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sparkles size={25} />
          </div>
          <div>
            <h2>IntelliChat ✨</h2>
            <p>AI Study & Productivity</p>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <button
  className="new-chat-btn"
  onClick={() => {
    onNewChat();
    setOpen(false);
  }}
>
  <Plus size={22} />
  New Chat
</button>

        <nav className="sidebar-nav">
          {menu.map((item, index) => (
            <button
              key={item.label}
              className={`nav-item ${index === 0 ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.label === "Study Tools" && (
                <ChevronDown size={16} className="nav-chevron" />
              )}
            </button>
          ))}
        </nav>

        <div className="recent-section">
          <h3>Recent Chats</h3>
          <div className="recent-placeholder">
            <MessageCircle size={18} />
            <span>Your conversations will appear here.</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <BookOpen size={24} />
            </div>
            <h3>Learn smarter ✨</h3>
            <p>Your AI-powered learning space.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
