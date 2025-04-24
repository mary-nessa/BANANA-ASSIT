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
      }

      const data = await response.json();
      const { token, userId, username: returnedUsername, role } = data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);

      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-in');
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 relative">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-10 text-gray-600 hover:text-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex justify-center mb-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="w-full mt-6">
          <p className="text-center text-gray-600 mb-4">Or continue with</p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleSocialSignIn()}
              className="cursor-pointer text-3xl hover:opacity-80 transition-opacity"
              aria-label="Sign in with Google"
            >
              <FcGoogle />
            </button>
            <button
              onClick={() => handleSocialSignIn()}
              className="cursor-pointer text-3xl text-blue-500 hover:opacity-80 transition-opacity"
              aria-label="Sign in with Twitter"
            >
              <FaTwitter />
            </button>
            <button
              onClick={() => handleSocialSignIn()}
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