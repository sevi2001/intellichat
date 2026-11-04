
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IntelliChat | AI Study & Productivity Assistant",
  description:
    "Your intelligent AI companion for studying, programming, writing, and productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
