'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Image,
  ClipboardList,
  Trees,
  MessageSquare,
  LineChart,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'User Management', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { name: 'Image Analysis', path: '/admin/images', icon: <Image className="h-5 w-5" /> },
  { name: 'Diagnosis Reports', path: '/admin/diagnostics', icon: <ClipboardList className="h-5 w-5" /> },
  { name: 'Banana Varieties', path: '/admin/varieties', icon: <Trees className="h-5 w-5" /> },
  { name: 'Chatbot', path: '/admin/chatbot', icon: <MessageSquare className="h-5 w-5" /> },
  { name: 'Analytics', path: '/admin/analytics', icon: <LineChart className="h-5 w-5" /> },
];

const settingsItem = { 
  name: 'Settings', 
  path: '/admin/settings', 
  icon: <Settings className="h-5 w-5" /> 
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="admin-sidebar bg-green-600 text-white p-4 flex flex-col h-full">
      <div className="sidebar-header mb-6 px-2">
        <h2 className="text-xl font-semibold">Banana Assist</h2>
      </div>
      
      <ul className="sidebar-menu space-y-2 flex-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors ${
                pathname === item.path
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:bg-opacity-50'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 border-t border-green-500">
        <ul className="sidebar-menu">
          <li>
            <Link
              href={settingsItem.path}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors ${
                pathname === settingsItem.path
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:bg-opacity-50'
              }`}
            >
              {settingsItem.icon}
              {settingsItem.name}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}