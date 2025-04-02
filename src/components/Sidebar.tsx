// components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiCamera, 
  FiGrid, 
  FiMessageSquare, 
  FiSettings, 
  FiLogIn, 
  FiUserPlus,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Set initial state and handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile); // Open on desktop, closed on mobile by default
    };

    handleResize(); // Initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const isActive = (path: string) => pathname === path;
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile toggle button - positioned below AppBar */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed z-40 p-3 m-2 rounded-lg bg-green-600 text-white transition-all duration-300 ${
            isOpen ? 'left-64' : 'left-0'
          }`}
          style={{ top: '5.5rem' }} // 5rem (AppBar) + 0.5rem
          aria-label="Toggle sidebar"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Sidebar - positioned below AppBar */}
      <nav
        className={`fixed top-20 h-[calc(100vh-5rem)] z-30 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 overflow-hidden'
        } ${!isMobile ? 'md:w-64' : ''}`}
      >
        <div className="flex flex-col h-full p-4 space-y-2 overflow-y-auto">
          {/* Navigation Links */}
          <NavLink
            href="/home"
            active={isActive('/home')}
            icon={<FiHome size={20} />}
            label="Home"
          />
          
          <NavLink
            href="/disease-detection"
            active={isActive('/disease-detection')}
            icon={<FiCamera size={20} />}
            label="Disease Detection"
          />
          
          <NavLink
            href="/variety-identification"
            active={isActive('/variety-identification')}
            icon={<FiGrid size={20} />}
            label="Variety Identification"
          />
        
          <NavLink
            href="/settings"
            active={isActive('/settings')}
            icon={<FiSettings size={20} />}
            label="Settings"
          />

          {/* Auth Links */}
          <div className="mt-auto space-y-2">
            <NavLink
              href="/signin"
              active={isActive('/signin')}
              icon={<FiLogIn size={20} />}
              label="Sign In"
            />
            
            <NavLink
              href="/signup"
              active={isActive('/signup')}
              icon={<FiUserPlus size={20} />}
              label="Sign Up"
            />
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

// NavLink component with TypeScript interface
interface NavLinkProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ href, active, icon, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center p-3 rounded-lg transition-colors ${
        active
          ? 'bg-green-100 text-green-800 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}