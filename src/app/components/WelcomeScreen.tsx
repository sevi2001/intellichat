
"use client";

import {
  BookOpen,
  CalendarDays,
  Code2,
  FileText,
  Lightbulb,
  Mail,
  PenLine,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Code2,
    title: "Programming Help",
    description: "Get code explanations, fix errors, and examples.",
  },
  {
    icon: BookOpen,
    title: "Study Support",
    description: "Understand topics, create notes, and quizzes.",
  },
  {
    icon: FileText,
    title: "Summarize Documents",
    description: "Turn long documents into concise summaries.",
  },
  {
    icon: PenLine,
    title: "Generate Content",
    description: "Create emails, essays, reports, and more.",
  },
  {
    icon: Lightbulb,
    title: "Ask Anything",
    description: "Get answers to your questions anytime.",
  },
];

const prompts = [
  { icon: Code2, text: "Explain Next.js in simple terms" },
  { icon: FileText, text: "Summarize my lecture notes" },
  { icon: CalendarDays, text: "Create a study plan for exams" },
  { icon: Mail, text: "Write a professional email" },
];

type WelcomeScreenProps = {
  onPrompt: (prompt: string) => void;
};

export default function WelcomeScreen({
  onPrompt,
}: WelcomeScreenProps) {
  return (
    <motion.div
      className="welcome-screen"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="robot-avatar"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="robot-antenna" />
        <div className="robot-face">
          <span className="robot-eyes">⌒ ⌒</span>
          <span className="robot-smile">ᴗ</span>
        </div>
      </motion.div>

      <div className="welcome-heading">
        <h1>
          Welcome to <span>IntelliChat</span> ✨
        </h1>
        <p>Your AI Study & Productivity Assistant</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.button
            key={feature.title}
            className="feature-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -7, scale: 1.02 }}
            onClick={() => onPrompt(
              feature.title === "Programming Help"
                ? "Help me understand a programming concept"
                : feature.title === "Study Support"
                ? "Help me study a difficult topic"
                : feature.title === "Summarize Documents"
                ? "Help me summarize a document"
                : feature.title === "Generate Content"
                ? "Help me write professional content"
                : "I have a question"
            )}
          >
            <div className="feature-icon">
              <feature.icon size={28} />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="suggestions">
        <h3>
          <Sparkles size={19} />
          Try asking:
        </h3>

        <div className="prompt-list">
          {prompts.map((prompt) => (
            <motion.button
              key={prompt.text}
              className="prompt-chip"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onPrompt(prompt.text)}
            >
              <prompt.icon size={17} />
              {prompt.text}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
