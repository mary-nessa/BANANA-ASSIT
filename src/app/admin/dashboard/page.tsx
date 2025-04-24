'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    diagnosesCount: 0,
    varietiesCount: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication and role
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.push('/signin');
      return;
    }

    // Verify admin role
    const verifyRole = async () => {
      try {
        const response = await fetch(`http://20.62.15.198:8080/api/users/username/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to verify user');
        }

        const user = await response.json();
        if (user.role !== 'ADMIN') {
          router.push('/home');
        }
      } catch (err) {
        setError('Authentication failed');
        router.push('/signin');
      }
    };

    verifyRole();
  }, [router]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No authentication token found');
        router.push('/signin');
        return;
      }

      try {
        // Fetch users
        const usersResponse = await fetch('http://20.62.15.198:8080/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const users = await usersResponse.json();
        const usersCount = users.length;

        // Fetch diagnoses (using a sample disease name, e.g., "Black Sigatoka")
        const diagnosesResponse = await fetch(
          'http://20.62.15.198:8080/api/diagnoses/disease/Black Sigatoka',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const diagnosesCount = diagnosesResponse.ok
          ? (await diagnosesResponse.json()).length
          : 0; // Fallback to 0 if endpoint fails

        // Fetch varieties (using a sample variety name, e.g., "Pisang Raja")
        const varietiesResponse = await fetch(
          'http://20.62.15.198:8080/api/varieties/name/Pisang Raja',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const varietiesCount = varietiesResponse.ok
          ? (await varietiesResponse.json()).length || 1 // Handle single record
          : 0; // Fallback to 0 if endpoint fails

        setStats({ usersCount, diagnosesCount, varietiesCount });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
            <p className="text-3xl font-bold text-green-600">{stats.usersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Total Diagnoses</h2>
            <p className="text-3xl font-bold text-green-600">{stats.diagnosesCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Total Varieties</h2>
            <p className="text-3xl font-bold text-green-600">{stats.varietiesCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}