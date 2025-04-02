"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiHome, FiEdit2, FiSave, FiGlobe, FiBell, FiTrash2, FiLogOut, FiChevronLeft, FiUser } from 'react-icons/fi';

export default function Settings() {
  const [language, setLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
  });
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-green-50 p-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/home" className="mr-3 text-green-600 hover:text-green-800">
            <FiChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-md shadow-xs border border-gray-100 p-4">
              <div className="flex items-center mb-3">
                <FiUser className="text-green-600 mr-2" size={18} />
                <h2 className="text-base font-semibold text-gray-900">Profile</h2>
              </div>
              
              {isEditingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full p-2 text-sm text-gray-800 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full p-2 text-sm text-gray-800 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                  <button
  onClick={() => setIsEditingProfile(false)}
  className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded hover:bg-red-50 text-red-500"
>
  Cancel
</button>

                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                    >
                      <FiSave className="mr-1" size={14} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-gray-700">Name</span>
                    <span className="text-sm font-medium text-gray-900">{profile.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-sm text-gray-700">Email</span>
                    <span className="text-sm font-medium text-gray-900">{profile.email}</span>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full mt-3 py-2 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
                  >
                    <FiEdit2 className="mr-1" size={14} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Language Card */}
            <div className="bg-white rounded-md shadow-xs border border-gray-100 p-4">
              <div className="flex items-center mb-3">
                <FiGlobe className="text-green-600 mr-2" size={18} />
                <h2 className="text-base font-semibold text-gray-900">Language</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 text-sm text-gray-800 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                >
                  <option value="English">English</option>
                  <option value="Luganda">Luganda</option>
                  <option value="Swahili">Swahili</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Notifications Card */}
            <div className="bg-white rounded-md shadow-xs border border-gray-100 p-4">
              <div className="flex items-center mb-3">
                <FiBell className="text-green-600 mr-2" size={18} />
                <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-sm text-gray-700">App Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            {/* Data Card */}
            <div className="bg-white rounded-md shadow-xs border border-gray-100 p-4">
              <div className="flex items-center mb-3">
                <FiTrash2 className="text-green-600 mr-2" size={18} />
                <h2 className="text-base font-semibold text-gray-900">Data</h2>
              </div>
              <button
                onClick={() => confirm('Clear all data?') && alert('Data cleared')}
                className="w-full mt-2 py-2 px-3 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
              >
                <FiTrash2 className="mr-1" size={14} />
                Clear All Data
              </button>
            </div>

            {/* Account Card */}
            <div className="bg-white rounded-md shadow-xs border border-gray-100 p-4">
              <div className="flex items-center mb-3">
                <FiLogOut className="text-green-600 mr-2" size={18} />
                <h2 className="text-base font-semibold text-gray-900">Account</h2>
              </div>
              <button
                onClick={() => confirm('Log out?') && alert('Logged out')}
                className="w-full py-2 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
              >
                <FiLogOut className="mr-1" size={14} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}