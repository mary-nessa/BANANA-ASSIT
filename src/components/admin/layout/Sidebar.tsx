'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';  import { 
    Users, 
    Settings, 
    LayoutDashboard, 
    FileText, 
    Image, 
    BarChart3,
    AlertCircle,
    MessageSquare,
    LogOut
  } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { 
    name: 'Dashboard', 
    path: '/admin/dashboard', 
    icon: <LayoutDashboard className="h-5 w-5" /> 
  },
  { 
    name: 'User Management', 
    path: '/admin/users', 
    icon: <Users className="h-5 w-5" /> 
  },
  { 
    name: 'Disease Reports', 
    path: '/admin/disease-reports', 
    icon: <AlertCircle className="h-5 w-5" /> 
  },
  { 
    name: 'Variety Database', 
    path: '/admin/varieties', 
    icon: <Image className="h-5 w-5" aria-hidden="true" /> 
  },
  { 
    name: 'User Feedback', 
    path: '/admin/feedback', 
    icon: <MessageSquare className="h-5 w-5" /> 
  },
  { 
    name: 'Analytics', 
    path: '/admin/analytics', 
    icon: <BarChart3 className="h-5 w-5" /> 
  },
  { 
    name: 'Activity Logs', 
    path: '/admin/logs', 
    icon: <FileText className="h-5 w-5" /> 
  },
];

const bottomItems = [
  { 
    name: 'Settings', 
    path: '/admin/settings', 
    icon: <Settings className="h-5 w-5" /> 
  }
];

export default function Sidebar() {
  const pathname = usePathname();
    const router = useRouter();
  
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/auth/signin');
  };

  return (
    <nav className="admin-sidebar bg-green-600 text-white p-4 flex flex-col h-full">
      <div className="sidebar-header mb-6 px-2">
        <h2 className="text-2xl font-bold">Admin Portal</h2>
        <p className="text-sm text-green-100 mt-1">Banana Assist</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="sidebar-menu space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  pathname === item.path
                    ? 'bg-green-700 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-500/20'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto pt-4 border-t border-green-500/30 space-y-2">
        <ul className="sidebar-menu space-y-1">
          {bottomItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  pathname === item.path
                    ? 'bg-green-700 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-500/20'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-green-50 hover:bg-green-500/20 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}