'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, AlertCircle, Sprout, BarChart2, Activity } from 'lucide-react';
import { API_BASE_URL } from '@/utils/analysis';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import RecentActivity from '@/components/admin/dashboard/RecentActivity';

interface ActivityLog {
  id: string;
  type: 'diagnosis' | 'identification' | 'user_login' | 'user_register';
  user: string;
  details: string;
  timestamp: string;
}

interface DashboardStats {
  usersCount: number;
  diagnosesCount: number;
  varietiesCount: number;
  activeUsers: number;
  accuracyRate: number;
  monthlyGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    diagnosesCount: 0,
    varietiesCount: 0,
    activeUsers: 0,
    accuracyRate: 0,
    monthlyGrowth: 0,
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      if (!token) {
        router.replace('/auth/signin');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, { headers });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Access denied - Requires admin privileges');
          } else if (response.status === 500) {
            throw new Error('Internal server error while gathering dashboard data');
          } else {
            throw new Error('Failed to fetch dashboard data');
          }
        }

        const data = await response.json();
        // Console log the raw API response
        console.log('Dashboard API Response:', JSON.stringify(data, null, 2));

        // Map API response to stats based on the actual structure
        setStats({
          usersCount: data.analytics?.userStats?.totalUsers || 0,
          diagnosesCount: data.analytics?.diseaseStats?.totalDiagnoses || 0,
          varietiesCount: data.analytics?.varietyStats?.totalIdentifications || 0,
          activeUsers: data.analytics?.userStats?.activeUsers || 0,
          accuracyRate: data.analytics?.systemStats?.accuracy || data.performance?.accuracy || 0,
          monthlyGrowth: 0, // No trend data available
        });

        // Map recent activities (no activity data present, so empty array)
        setActivities([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Monitor system performance and key metrics</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.usersCount}
              change={stats.monthlyGrowth}
              icon={Users}
              iconColor="bg-blue-500"
              trend="up"
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsers}
              icon={Activity}
              iconColor="bg-green-500"
            />
            <StatsCard
              title="Disease Reports"
              value={stats.diagnosesCount}
              icon={AlertCircle}
              iconColor="bg-red-500"
            />
            <StatsCard
              title="Varieties"
              value={stats.varietiesCount}
              icon={Sprout}
              iconColor="bg-purple-500"
            />
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Performance Metrics</h2>
                <BarChart2 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Accuracy Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats.accuracyRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 rounded-full h-2"
                      style={{ width: `${stats.accuracyRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Monthly Growth</span>
                    <span className="text-sm font-medium text-blue-600">
                      {stats.monthlyGrowth}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2"
                      style={{ width: `${stats.monthlyGrowth}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <RecentActivity activities={activities} />
          </div>
        </div>
      )}
    </div>
  );
}