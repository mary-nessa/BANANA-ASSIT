// src/app/admin/dashboard/page.tsx
import StatsCard from '@/components/admin/dashboard/StatsCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard 
          title="Total Users" 
          value="1,234" 
          trend="up" 
          icon="👥"
          description="All registered accounts"
          className="hover:shadow-lg transition-shadow"
        />
        <StatsCard 
          title="New Users" 
          value="56" 
          trend="up" 
          icon="🆕"
          description="This week"
          className="hover:shadow-lg transition-shadow"
        />
      </div>
    </div>
  );
}