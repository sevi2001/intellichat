
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

type MarkdownMessageProps = {
  content: string;
};

export default function MarkdownMessage({
  content,
}: MarkdownMessageProps) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <div className="markdown-message">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(
              className || ""
            );

            const code = String(children).replace(
              /\n$/,
              ""
            );

            if (match) {
              return (
                <CodeBlock
                  language={match[1]}
                  code={code}
                />
              );
            }

            return (
              <code
                className="inline-code"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      <button
        type="button"
        className="copy-message-btn"
        onClick={copyMessage}
        title="Copy response"
      >
        {copied ? (
          <>
            <Check size={15} />
            Copied
          </>
        ) : (
          <>
            <Copy size={15} />
            Copy response
          </>
        )}
      </button>
    </div>
  );
}

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }

  return (
    <div className="ai-code-block">
      <div className="ai-code-header">
        <span>{language}</span>

        <button
          type="button"
          onClick={copyCode}
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy code
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: "18px",
          borderRadius: "0 0 12px 12px",
          fontSize: "13px",
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
