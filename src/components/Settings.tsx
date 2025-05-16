"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FiEdit2, FiSave, FiGlobe, FiBell, FiTrash2, FiLogOut, FiChevronLeft, FiUser } from 'react-icons/fi';

export default function Settings() {
  const [language, setLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
  });

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/home" className="mr-3 text-green-600 hover:text-green-800">
            <FiChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Column - Wider */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card - Expanded */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FiUser className="text-green-600 mr-3" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-sm text-green-600 hover:text-green-800 flex items-center"
                  >
                    <FiEdit2 className="mr-1" size={16} />
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full p-3 text-sm text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full p-3 text-sm text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2.5 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2.5 px-4 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
                    >
                      <FiSave className="mr-2" size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Full Name</span>
                    <span className="text-sm font-medium text-gray-900">{profile.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Email Address</span>
                    <span className="text-sm font-medium text-gray-900">{profile.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preferences Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div>
                  <div className="flex items-center mb-3">
                    <FiGlobe className="text-green-600 mr-3" size={20} />
                    <h3 className="text-base font-medium text-gray-900">Language</h3>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 text-sm text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="English">English</option>
                    <option value="Luganda">Luganda</option>
                    <option value="Swahili">Swahili</option>
                  </select>
                </div>

                {/* Notifications */}
                <div>
                  <div className="flex items-center mb-3">
                    <FiBell className="text-green-600 mr-3" size={20} />
                    <h3 className="text-base font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Enable Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Column */}
          <div className="space-y-6">
            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => confirm('Log out?') && alert('Logged out')}
                  className="w-full py-3 px-4 text-sm bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <FiLogOut className="mr-2" size={16} />
                  Log Out
                </button>
                
                <button
                  onClick={() => confirm('Delete your account? This cannot be undone.') && alert('Account deleted')}
                  className="w-full py-3 px-4 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors"
                >
                  <FiTrash2 className="mr-2" size={16} />
                  Delete Account
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => confirm('Export all your data?') && alert('Data exported')}
                  className="w-full py-3 px-4 text-sm bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  Export Data
                </button>
                
                <button
                  onClick={() => confirm('Clear all app data?') && alert('Data cleared')}
                  className="w-full py-3 px-4 text-sm bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <FiTrash2 className="mr-2" size={16} />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}