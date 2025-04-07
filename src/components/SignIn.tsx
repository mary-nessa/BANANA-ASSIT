// components/SignIn.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitter, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';

// Fixed admin credentials
const ADMIN_EMAIL = "admin@bananaassist.com";
const ADMIN_PASSWORD = "admin123"; // In production, use environment variables

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Check for admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
        return;
      }
      
      // Regular user authentication (mock implementation)
      // In a real app, you would verify against your user database
      if (email && password) {
        router.push('/home');
      } else {
        setError('Please enter both email and password');
      }
      
    } catch (err) {
      setError('Authentication failed');
      console.error(err);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    // Social sign-in always goes to user home
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
          SIGN IN
        </h1>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center mb-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="w-full mt-6">
          <p className="text-center text-gray-600 mb-4">Or continue with</p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleSocialSignIn('google')}
              className="cursor-pointer text-3xl hover:opacity-80 transition-opacity"
              aria-label="Sign in with Google"
            >
              <FcGoogle />
            </button>
            <button
              onClick={() => handleSocialSignIn('twitter')}
              className="cursor-pointer text-3xl text-blue-500 hover:opacity-80 transition-opacity"
              aria-label="Sign in with Twitter"
            >
              <FaTwitter />
            </button>
            <button
              onClick={() => handleSocialSignIn('facebook')}
              className="cursor-pointer text-3xl text-blue-600 hover:opacity-80 transition-opacity"
              aria-label="Sign in with Facebook"
            >
              <FaFacebook />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-green-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}