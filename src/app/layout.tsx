// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./layout-wrapper";

export const metadata: Metadata = {
  title: "Banana Assist",
  description: "AI-powered banana disease detection",
  icons: {
    icon: "/favicon.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}