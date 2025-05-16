"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiX, FiLoader } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

interface Planting {
  id: string;
  plotIdentifier: string;
  plantingDate: string;
  expectedHarvestDate: string;
  currentStage: string;
  daysFromPlanting: number;
  numberOfPlants: number;
  bananaVariety: string;
  upcomingTasks: [];
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercentage: number;
}

const PlantationManagement: React.FC = () => {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPlanting, setNewPlanting] = useState({
    plotIdentifier: '',
    plantingDate: new Date().toISOString().split('T')[0],
    numberOfPlants: 100,
    bananaVariety: 'Gonja',
  });
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!authToken) {
      router.push('/auth/signin');
    } else if (userRole === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setLoading(false);
      return;
    }

    const fetchPlantings = async () => {
      try {
        const response = await fetch('/api/plantings/active', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch plantings: ${response.status}`);
        const data: Planting[] = await response.json();
        setPlantings(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error fetching plantings: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlantings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPlanting((prev) => ({
      ...prev,
      [name]: name === 'numberOfPlants' ? parseInt(value) || 0 : value,
    }));
  };

  const createNewPlanting = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('You must be signed in to create a planting');
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch('/api/plantings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newPlanting),
      });
      if (!response.ok) throw new Error(`Failed to create planting: ${response.status}`);
      const data: Planting = await response.json();
      setPlantings([...plantings, data]);
      toast.success('New planting created');
      setShowForm(false);
      setNewPlanting({
        plotIdentifier: '',
        plantingDate: new Date().toISOString().split('T')[0],
        numberOfPlants: 100,
        bananaVariety: 'Gonja',
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error creating planting: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="animate-spin text-green-600 text-4xl" />
          <p className="text-lg font-medium text-gray-700">Loading Plantings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 bg-gradient-to-br from-green-50 to-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-green-600 tracking-tight">
              Plantation Management
            </h2>
            <p className="text-gray-600 mt-2">Manage your banana plantations and track progress</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-green-800 active:bg-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FiPlus className="mr-2 text-xl" /> Create New Planting
          </button>
        </div>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Planting</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="text-2xl" />
              </button>
            </div>
            <form onSubmit={createNewPlanting} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Identifier
                  </label>
                  <input
                    type="text"
                    name="plotIdentifier"
                    value={newPlanting.plotIdentifier}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., PLOT-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planting Date
                  </label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={newPlanting.plantingDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Plants
                  </label>
                  <input
                    type="number"
                    name="numberOfPlants"
                    value={newPlanting.numberOfPlants}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banana Variety
                  </label>
                  <select
                    name="bananaVariety"
                    value={newPlanting.bananaVariety}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="Gonja">Gonja</option>
                    <option value="Cavendish">Cavendish</option>
                    <option value="Sukali Ndizi">Sukali Ndizi</option>
                    <option value="Matooke">Matooke</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 active:bg-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Create Planting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Active Plantings</h3>
          <p className="text-gray-600">{plantings.length} active plantings</p>
        </div>
        {plantings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mt-4">No active plantings found</h4>
              <p className="text-gray-600 mt-2">
                Get started by creating your first banana plantation
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiPlus className="mr-2" /> Create Planting
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantings.map((planting) => (
              <div
                key={planting.id}
                className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-green-100 group"
                onClick={() => router.push(`/plantings/${planting.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {planting.plotIdentifier}
                  </h4>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {planting.bananaVariety}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Planted: {new Date(planting.plantingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Stage: {planting.currentStage.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{planting.numberOfPlants} plants</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Progress</span>
                    <span>{planting.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${planting.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{planting.completedTasksCount} tasks completed</span>
                    <span>{planting.totalTasksCount - planting.completedTasksCount} remaining</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PlantationManagement;