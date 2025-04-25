'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/utils/analysis';

interface Variety {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  imageUrl: string;
  createdAt: string;
}

export default function VarietiesPage() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`${API_BASE_URL}/api/varieties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch varieties');
        }

        const data = await response.json();
        setVarieties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load varieties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVarieties();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Variety Database</h1>
          <p className="text-gray-600 mt-1">Manage banana varieties and their characteristics</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
          <PlusCircle className="h-5 w-5" />
          Add New Variety
        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {varieties.map((variety) => (
            <div key={variety.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 relative">
                <img
                  src={variety.imageUrl}
                  alt={variety.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{variety.name}</h3>
                <p className="text-gray-600 mt-1 text-sm">{variety.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variety.characteristics.map((char, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Added {new Date(variety.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
