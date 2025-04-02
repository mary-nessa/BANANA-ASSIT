// app/layout-with-sidebar.tsx
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LayoutWithSidebar({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-green-50">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="flex flex-col h-full p-4 space-y-2">
          <Link 
            href="/home" 
            className={`flex items-center p-3 rounded-lg ${
              isActive('/home') 
                ? 'bg-green-100 text-green-800 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl mr-3">🏠</span>
            <span className="hidden md:block">Home</span>
          </Link>
          
          {/* Other sidebar links... */}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 md:ml-64 p-4">
        {children}
      </main>
    </div>
  );
}