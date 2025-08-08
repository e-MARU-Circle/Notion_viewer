import type { Metadata } from "next";
// ★★★ フォントを'M PLUS Rounded 1c'から'Noto_Sans_JP'に変更 ★★★
import { Noto_Sans_JP } from "next/font/google"; 
import "./globals.css";

// ★★★ Noto Sans JP を設定 ★★★
// Noto Sans JPでは、'latin'サブセットに日本語が含まれます
const noto_sans_jp = Noto_Sans_JP({
  weight: ['300', '400', '500', '700'], // Light, Regular, Medium, Bold
  subsets: ['latin'], 
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Notion Knowledge Graph",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full bg-slate-100">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      {/* ★★★ bodyタグに新しいフォントのクラスを適用 ★★★ */}
      <body className={`${noto_sans_jp.className} h-full`}>
        {children}
      </body>
    </html>
  );
}