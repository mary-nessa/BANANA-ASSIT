// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  userID: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  contact: string;
  location: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    location: '',
  });
  const router = useRouter();

  // Check admin role
  useEffect(() => {
    const role = getCookie('role');
    const token = getCookie('token');

    if (!token || role !== 'ADMIN') {
      router.push('/signin?redirect=/admin/users');
    }
  }, [router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = getCookie('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search users
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // View user details
  const viewUserDetails = async (userId: string) => {
    try {
      const token = getCookie('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user details');
      const userData = await response.json();
      setSelectedUser(userData);
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        contact: userData.contact,
        location: userData.location,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = getCookie('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      // Refresh user list
      setUsers(users.filter(user => user.userID !== userId));
      if (selectedUser?.userID === userId) setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  // Update user
  const updateUser = async (userId: string) => {
    try {
      const token = getCookie('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update user');

      // Refresh user list and details
      const updatedUser = await response.json();
      setUsers(users.map(user => user.userID === userId ? updatedUser : user));
      setSelectedUser(updatedUser);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <Link href="/" className="text-green-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <p className="text-center text-gray-600">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-gray-600">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 border-b text-left text-gray-700">Name</th>
                      <th className="py-3 px-4 border-b text-left text-gray-700">Email</th>
                      <th className="py-3 px-4 border-b text-left text-gray-700">Role</th>
                      <th className="py-3 px-4 border-b text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.userID} className="hover:bg-gray-50">
                        <td className="py-3 px-4 border-b">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-4 border-b">{user.email}</td>
                        <td className="py-3 px-4 border-b">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b space-x-2">
                          <button
                            onClick={() => viewUserDetails(user.userID)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteUser(user.userID)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">User Details</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Contact</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editForm.contact}
                        onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Location</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => updateUser(selectedUser.userID)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium">{selectedUser.contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{selectedUser.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-medium">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="font-medium">
                        {selectedUser.lastLogin ? 
                          new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border text-center text-gray-500">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

