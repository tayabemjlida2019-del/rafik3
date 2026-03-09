import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "رفيق - المرشد السياحي الذكي",
  description: "روبوت ذكاء اصطناعي لاكتشاف الجزائر: مواقع سياحية، فنادق، وأنشطة.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
