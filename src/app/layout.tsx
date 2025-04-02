// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import UploadProgress from "@/components/UploadProgress";
import AppBar from "@/components/AppBar";
import { FaRobot } from "react-icons/fa"; 

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
        <UploadProgress />
        <AppBar />
        <div className="flex min-h-screen bg-green-50 pt-20"> {/* Match AppBar height */}
          <Sidebar />
          <main className="flex-1 ml-20 md:ml-64 p-4">
            {children}
          </main>
          
          {/* Floating AI Chatbot Button - Moved higher with robot icon */}
          <a
            href="/chatbot"
            className="fixed bottom-20 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
            aria-label="AI Chatbot"
          >
            <FaRobot size={24} className="text-white" />
          </a>
        </div>
      </body>
    </html>
  );
}