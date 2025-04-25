"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitter, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Start loading

    try {
      const response = await fetch('http://20.62.15.198:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials');
        }
        throw new Error('Authentication failed');
      }      const data = await response.json();
      const { token, userId, role } = data;      // First set the cookies
      document.cookie = `authToken=${token}; path=/`;
      document.cookie = `userRole=${role}; path=/`;

      // Then set localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);

      // Clear any existing error
      setError('');

      // Use router.replace instead of push to avoid adding to history
      if (role === 'ADMIN') {
        await router.replace('/admin/dashboard');
      } else {
        await router.replace('/home');
      }
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign-in';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleSocialSignIn = () => {
    setError('Social sign-in is not supported at this time. Please use your username and password to sign in.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-600">
          Welcome Back
        </h1>
        
        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="username">
              Username
            </label>
            <input
              className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 pr-10"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2.5 top-8 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            </button>
          </div>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm flex items-center justify-center"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-3 flex justify-center space-x-4">
            <button
              onClick={() => handleSocialSignIn()}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Sign in with Google"
            >
              <FcGoogle size={20} />
            </button>
            <button
              onClick={() => handleSocialSignIn()}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Sign in with Twitter"
            >
              <FaTwitter size={20} className="text-blue-400" />
            </button>
            <button
              onClick={() => handleSocialSignIn()}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Sign in with Facebook"
            >
              <FaFacebook size={20} className="text-blue-600" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-green-600 hover:text-green-500 font-medium">
            Sign up
          </Link>
        </p>
      </div>
      </div>
  );
}