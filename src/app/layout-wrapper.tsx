// app/layout-wrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import UploadProgress from "@/components/UploadProgress";
import AppBar from "@/components/AppBar";
import { FaRobot } from "react-icons/fa";
import Link from "next/link";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  
  useEffect(() => {
    // Check if current route is an admin route
    setIsAdminRoute(pathname?.startsWith('/admin') || false);
  }, [pathname]);
  
  // If it's an admin route, just render children (admin layout will be applied)
  if (isAdminRoute) {
    return <>{children}</>;
  }
  
  // Otherwise use the standard user layout
  return (
    <>
      <UploadProgress />
      <AppBar />
      <div className="flex min-h-screen bg-green-50 pt-20">
        <Sidebar />
        <main className="flex-1 ml-20 md:ml-64 p-4">
          {children}
        </main>

        {/* Floating AI Chatbot Button */}
        <Link
          href="/chatbot"
          className="fixed bottom-20 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
          aria-label="AI Chatbot"
        >
          <FaRobot size={24} className="text-white" />
        </Link>
      </div>
    </>
  );
}
