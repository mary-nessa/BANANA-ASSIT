// src/app/admin/dashboard/page.tsx
import StatsCard from '@/components/admin/dashboard/StatsCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value="1,234" 
          trend="up" 
          icon="👥"
          description="+12% from last month"
          className="hover:shadow-lg transition-shadow"
        />
        <StatsCard 
          title="Images Processed" 
          value="5,678" 
          trend="up" 
          icon="🖼️"
          description="+24% from last week"
          className="hover:shadow-lg transition-shadow"
        />
        <StatsCard 
          title="Common Diagnosis" 
          value="Panama Disease" 
          icon="🔍"
          description="Most frequent detection"
          className="hover:shadow-lg transition-shadow bg-amber-50"
        />
        <StatsCard 
          title="Active Sessions" 
          value="42" 
          trend="down" 
          icon="💻"
          description="-5% from yesterday"
          className="hover:shadow-lg transition-shadow"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="bg-green-100 p-2 rounded-full mr-4">
              <span className="text-green-600">📊</span>
            </div>
            <div>
              <p className="font-medium">New user registered</p>
              <p className="text-sm text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <span className="text-blue-600">🖼️</span>
            </div>
            <div>
              <p className="font-medium">Image analysis completed</p>
              <p className="text-sm text-gray-500">15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}