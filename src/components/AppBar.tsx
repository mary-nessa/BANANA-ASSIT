// components/AppBar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiBell, FiX, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Mock user data
const MOCK_USER = {
  name: "Hope Babirye",
  email: "hope@gmail.com",
  link: "/Settings"
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "Your banana disease scan results are ready",
    timestamp: "2 minutes ago",
    read: false,
    link: "/disease-results/123"
  },
  {
    id: 2,
    message: "Gonja is rated among the best varieties",
    timestamp: "1 hour ago",
    read: false,
    link: "/varieties"
  },
  
];

const SEARCHABLE_PAGES = [
  { 
    name: 'Home', 
    path: '/home', 
    keywords: ['home', 'dashboard', 'main'] 
  },
  { 
    name: 'Disease Detection', 
    path: '/disease-detection', 
    keywords: ['disease', 'detection', 'plant', 'health'] 
  },
  { 
    name: 'Variety Identification', 
    path: '/variety-identification', 
    keywords: ['variety', 'identification', 'type', 'banana type'] 
  },
  { 
    name: 'AI Chatbot', 
    path: '/chatbot', 
    keywords: ['chat', 'bot', 'ai', 'assistant', 'help'] 
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    keywords: ['settings', 'preferences', 'configuration'] 
  },
  
];

export default function AppBar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SEARCHABLE_PAGES>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get user initials
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Calculate unread notifications
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = SEARCHABLE_PAGES.filter(page => 
      page.name.toLowerCase().includes(query) || 
      page.keywords.some(keyword => keyword.includes(query))
    ).slice(0, 5);

    setSearchResults(results);
  }, [searchQuery]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  const handleNotificationClick = (link: string, id: number) => {
    markAsRead(id);
    router.push(link);
    setNotificationsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].path);
      setSearchOpen(false);
    }
  };

  const navigateToResult = (path: string) => {
    router.push(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
    router.push('/signin');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm h-20">
      <div className="flex items-center justify-between h-full w-full px-4">
        {/* Left side - Logo and App Name */}
        <div className="flex items-center">
          <div className="mr-3">
            <Link href="/">
              <Image
                src="/images/splashscreenimg.jpeg"
                alt="Banana Assist Logo"
                width={50}
                height={50}
                className="rounded-full object-cover"
                priority
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-green-600">BANANA ASSIST</h1>
        </div>

        {/* Right side - Search, Notification, and Profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            {searchOpen ? (
              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pages..."
                    className="py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 w-64 text-black"
                    autoFocus
                    style={{ color: 'black' }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-10 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={20} />
                  </button>
                  <FiSearch 
                    size={18} 
                    className="absolute right-3 top-3 text-gray-400" 
                  />
                </form>

                {/* Search results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {searchResults.map((result) => (
                      <div
                        key={result.path}
                        onClick={() => navigateToResult(result.path)}
                        className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">{result.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-green-600"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-gray-600 hover:text-green-600 relative"
              aria-label="Notifications"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium">Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.link, notification.id)}
                        className={`p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-green-50' : ''}`}
                      >
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-800">{notification.message}</p>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center rounded-full h-10 w-10 bg-blue-100 focus:outline-none"
              aria-label="User profile"
            >
              <span className="font-bold text-blue-600 text-lg">
                {getInitials(MOCK_USER.name)}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full h-10 w-10 bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600 text-lg">
                        {getInitials(MOCK_USER.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{MOCK_USER.name}</p>
                      <p className="text-sm text-gray-500">{MOCK_USER.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings" // Changed to settings page
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50"
                  >
                    <FiUser className="mr-3" />
                    <span>Profile & Settings</span> {/* Updated label */}
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-green-50"
                  >
                    <FiLogOut className="mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}