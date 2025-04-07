// src/app/admin/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/admin/layout/Sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-green-50">
      <Sidebar />
      <div className="flex flex-col">
        <main className="flex-1 p-4 md:p-6 bg-white rounded-lg m-4 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}