// components/MainLayout.tsx
"use client";

import Sidebar from './Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-64 p-4">
        {children}
      </main>
    </div>
  );
}