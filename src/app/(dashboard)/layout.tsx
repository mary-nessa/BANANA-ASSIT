import AppBar from "@/components/AppBar";
import Sidebar from "@/components/Sidebar";
import { FaRobot } from "react-icons/fa";
import UploadProgress from "@/components/UploadProgress";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banana Assist - Dashboard",
  description: "AI-powered banana disease detection and variety identification",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <UploadProgress />
      <AppBar />
      <div className="flex min-h-screen bg-green-50 pt-20">
      <Sidebar />
      <main className="pt-10 md:pl-64">
        {children}
      </main>
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
