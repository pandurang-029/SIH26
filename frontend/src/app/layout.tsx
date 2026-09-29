import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TransformAI - AI Content Transformation Platform",
  description:
    "Transform any content into something more powerful. AI-powered automated transformation for summaries, study notes, presentations, reports, social posts, FAQs and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
