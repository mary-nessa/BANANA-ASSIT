'use client';

import { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/utils/analysis';

interface AnalyticsData {
  userStats: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  diseaseStats: {
    totalScans: number;
    commonDiseases: { name: string; count: number }[];
    accuracyRate: number;
  };
  varietyStats: {
    totalIdentifications: number;
    commonVarieties: { name: string; count: number }[];
    accuracyRate: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`${API_BASE_URL}/api/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor system performance and user activity</p>
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
      ) : analytics && (
        <div className="space-y-6">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">User Stats</h3>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.userStats.total}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-lg font-semibold text-gray-800">{analytics.userStats.active}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">New This Month</p>
                    <p className="text-lg font-semibold text-green-600">+{analytics.userStats.newThisMonth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disease Detection Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Disease Detection</h3>
                <LineChart className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.diseaseStats.totalScans}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Accuracy Rate</p>
                  <p className="text-lg font-semibold text-green-600">{analytics.diseaseStats.accuracyRate}%</p>
                </div>
              </div>
            </div>

            {/* Variety Identification Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Variety Identification</h3>
                <PieChart className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Identifications</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.varietyStats.totalIdentifications}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Accuracy Rate</p>
                  <p className="text-lg font-semibold text-green-600">{analytics.varietyStats.accuracyRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Common Diseases */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Common Diseases</h3>
            <div className="grid grid-cols-2 gap-4">
              {analytics.diseaseStats.commonDiseases.map((disease, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{disease.name}</span>
                  <span className="text-green-600 font-medium">{disease.count} cases</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Varieties */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Identified Varieties</h3>
            <div className="grid grid-cols-2 gap-4">
              {analytics.varietyStats.commonVarieties.map((variety, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{variety.name}</span>
                  <span className="text-green-600 font-medium">{variety.count} identifications</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
