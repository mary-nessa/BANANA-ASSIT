// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, UserPlus, LogOut } from 'lucide-react';

type User = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string; // Added username field to display in the table
  location: string;
  role?: string;
  contact: string;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    contact: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const getCookie = (name: string): string | undefined => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getCookie('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          document.cookie = 'token=; path=/; max-age=0';
          document.cookie = 'role=; path=/; max-age=0';
          document.cookie = 'userId=; path=/; max-age=0';
          setError('Session expired. Redirecting to sign-in...');
          setTimeout(() => router.push('/signin'), 2000);
          setIsLoading(false);
          return;
        }

        if (response.ok) {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setUsers(data);
          } else {
            setError('Unexpected response format from the server');
          }
        } else {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to fetch users');
          } else {
            setError('Failed to fetch users. Please try again.');
          }
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('An unexpected error occurred while fetching users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (isCreating && formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      location: '',
      contact: '',
      password: '',
    });
  };

  const handleEdit = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      contact: user.contact,
      password: '',
    });
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const token = getCookie('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/delete/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          document.cookie = 'token=; path=/; max-age=0';
          document.cookie = 'role=; path=/; max-age=0';
          document.cookie = 'userId=; path=/; max-age=0';
          setError('Session expired. Redirecting to sign-in...');
          setTimeout(() => router.push('/signin'), 2000);
          return;
        }

        if (response.ok) {
          setUsers(users.filter(user => user.userId !== userId));
        } else {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to delete user');
          } else {
            setError('Failed to delete user. Please try again.');
          }
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('An unexpected error occurred while deleting the user. Please try again later.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = getCookie('token');
    try {
      if (isCreating) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            contact: formData.contact,
            location: formData.location,
          }),
        });

        if (response.status === 401) {
          document.cookie = 'token=; path=/; max-age=0';
          document.cookie = 'role=; path=/; max-age=0';
          document.cookie = 'userId=; path=/; max-age=0';
          setError('Session expired. Redirecting to sign-in...');
          setTimeout(() => router.push('/signin'), 2000);
          return;
        }

        if (response.ok) {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const newUser = await response.json();
            setUsers([...users, { ...newUser, role: 'User' }]);
            setIsCreating(false);
          } else {
            setError('Unexpected response format from the server');
            return;
          }
        } else {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to create user');
          } else {
            setError('Failed to create user. Please try again.');
          }
          return;
        }
      } else if (isEditing && currentUser) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/update/${currentUser.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            contact: formData.contact,
            location: formData.location,
          }),
        });

        if (response.status === 401) {
          document.cookie = 'token=; path=/; max-age=0';
          document.cookie = 'role=; path=/; max-age=0';
          document.cookie = 'userId=; path=/; max-age=0';
          setError('Session expired. Redirecting to sign-in...');
          setTimeout(() => router.push('/signin'), 2000);
          return;
        }

        if (response.ok) {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const updatedUser = await response.json();
            setUsers(users.map(user => (user.userId === currentUser.userId ? updatedUser : user)));
            setIsEditing(false);
          } else {
            setError('Unexpected response format from the server');
            return;
          }
        } else {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to update user');
          } else {
            setError('Failed to update user. Please try again.');
          }
          return;
        }
      }

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        location: '',
        contact: '',
        password: '',
      });
      setCurrentUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('An unexpected error occurred while saving the user. Please try again later.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      location: '',
      contact: '',
      password: '',
    });
    setError('');
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    document.cookie = 'userId=; path=/; max-age=0';
    router.push('/signin');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <p className="text-lg text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (error && !isCreating && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            <UserPlus className="h-5 w-5" />
            Add User
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {(isEditing || isCreating) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isCreating ? 'Create New User' : 'Edit User'}
          </h2>
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              {isCreating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    minLength={8}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                {isCreating ? 'Create User' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Created At
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{user.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                    ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}
                  >
                    {user.role || 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{user.contact}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{new Date(user.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3 p-1 hover:bg-blue-50 rounded"
                    aria-label={`Edit ${user.firstName} ${user.lastName}`}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.userId)}
                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                    aria-label={`Delete ${user.firstName} ${user.lastName}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}