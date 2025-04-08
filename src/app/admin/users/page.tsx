'use client';
import { useState } from 'react';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

// Define a User type
type User = {
  id: number;
  name: string;
  email: string;
  location: string;
  role: string;
};

// Sample user data - in a real app, this would come from an API
const initialUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', location: 'New York', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', location: 'Los Angeles', role: 'Manager' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', location: 'Chicago', role: 'User' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', location: 'Miami', role: 'User' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    role: ''
  });

  // Create new user
  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      email: '',
      location: '',
      role: 'User'
    });
  };

  // Edit existing user
  const handleEdit = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      location: user.location,
      role: user.role
    });
  };

  // Delete user
  const handleDelete = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save user (create or update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) {
      // Create new user
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData
      };
      setUsers([...users, newUser]);
      setIsCreating(false);
    } else if (isEditing && currentUser) {  // Added null check here
      // Update existing user
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...formData } : user
      ));
      setIsEditing(false);
    }
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      location: '',
      role: ''
    });
    setCurrentUser(null);
  };

  // Cancel form
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      location: '',
      role: ''
    });
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <UserPlus className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* User Form (Edit/Create) */}
      {(isEditing || isCreating) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {isCreating ? 'Create New User' : 'Edit User'}
          </h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
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

      {/* Users Table */}
      <div className="bg-white overflow-hidden shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Name
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
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">{user.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                    ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3 p-1 hover:bg-blue-50 rounded"
                    aria-label={`Edit ${user.name}`}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                    aria-label={`Delete ${user.name}`}
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