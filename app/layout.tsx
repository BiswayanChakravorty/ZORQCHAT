import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "ZORD — Discover. Create. Share.",
  description: "Discover AI image ideas, use structured prompts, add your reference and create your own.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthGuard />
        {children}
      </body>
    </html>
  );
}
