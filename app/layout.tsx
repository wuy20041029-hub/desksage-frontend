import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "工位格局 · 八字参断",
  description: "工位与八字合断事业运",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen paper-bg">
        {children}
      </body>
    </html>
  );
}
