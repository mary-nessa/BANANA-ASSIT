// src/app/admin/dashboard/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    document.cookie = 'userId=; path=/; max-age=0';
    router.push('/signin');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700">Welcome to the Admin Dashboard!</p>
      </div>
    </div>
  );
}