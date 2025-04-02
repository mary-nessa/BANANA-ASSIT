"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeScreen from '../components/HomeScreen';

export default function WelcomePage() {
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const router = useRouter();

  // If showHomeScreen is true, render the HomeScreen component
  if (showHomeScreen) {
    return <HomeScreen />;
  }

  // Otherwise, render the welcome screen
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-4 relative">
      {/* Background circles */}
      <div className="h-full w-full absolute">
        <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-green-800 opacity-20"></div>
        <div className="absolute top-1/4 right-12 w-16 h-16 rounded-full bg-green-600 opacity-20"></div>
        <div className="absolute bottom-20 left-8 w-10 h-10 rounded-full bg-green-400 opacity-20"></div>
        <div className="absolute bottom-4 left-1/3 w-16 h-16 rounded-full bg-green-700 opacity-20"></div>
      </div>
      
      {/* Welcome content */}
      <div className="text-center text-gray-800 mb-12 z-10">
        <h1 className="text-4xl font-bold mb-4 text-green-800">BANANA ASSIST</h1>
        <p className="text-lg opacity-90">Your solution to better farming</p>
      </div>
      
      {/* Clickable "Next" text - now using router for better navigation */}
      <div 
        onClick={() => {
          setShowHomeScreen(true);
          // Alternative: router.push('/home') if you prefer page-based navigation
        }}
        className="absolute bottom-8 left-8 z-10 text-green-600 hover:text-green-800 font-medium transition-colors cursor-pointer underline"
      >
        Next
      </div>
    </main>
  );
}