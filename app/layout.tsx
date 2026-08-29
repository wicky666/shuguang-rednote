import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shuguang-rednote.wicky9073.chatgpt.site"),
  title: "薯光 · 小红书内容创作工作台",
  description: "从选题到成稿：生成标题、正文结构和标签，并在发布前完成内容检查。",
  applicationName: "薯光",
  category: "productivity",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "薯光",
    title: "薯光 · 小红书内容创作工作台",
    description: "从一个想法，到一篇完整笔记。",
    images: [{ url: "/og.png", width: 1729, height: 909, alt: "薯光 · 从一个想法，到一篇完整笔记" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "薯光 · 小红书内容创作工作台",
    description: "从一个想法，到一篇完整笔记。",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
