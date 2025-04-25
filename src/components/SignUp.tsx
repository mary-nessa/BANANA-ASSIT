"use client";

import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitter, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usernameNotification, setUsernameNotification] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (usernameNotification) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [usernameNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUsernameNotification(null);
    setIsLoading(true);

    try {
      console.log('Submitting form with data:', {
        firstName,
        lastName,
        email,
        password,
        contact,
        location,
      });
      const createResponse = await fetch('http://20.62.15.198:8080/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          contact,
          location,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Error creating user:', errorData);
        throw new Error(errorData.message || 'Failed to create user');
      }

      const userData = await createResponse.json();
      const generatedUsername = userData.username;

      setUsernameNotification(
        `Account created successfully, view username: "${generatedUsername}". Please use this username to sign in.`
      );

      // Clear form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setContact('');
      setLocation('');

    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = () => {
    setError('Social sign-up is not supported at this time. Please use the form to sign up.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-600">
          Create Account
        </h1>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {usernameNotification && (
          <div className="mb-3 p-2 bg-green-100 text-green-700 text-sm rounded">
            {usernameNotification}{' '}
            <Link href="/auth/signin" className="text-green-600 hover:text-green-500 font-medium">
              Sign in now
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Create a password"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="contact">
                Contact
              </label>
              <input
                className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                id="contact"
                type="tel"
                placeholder="+256..."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="location">
                Location
              </label>
              <input
                className="shadow-sm border rounded w-full py-1.5 px-3 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                id="location"
                type="text"
                placeholder="Your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
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
              onClick={handleSocialSignUp}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Sign up with Google"
            >
              <FcGoogle size={20} />
            </button>
            <button
              onClick={handleSocialSignUp}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Sign up with Twitter"
            >
              <FaTwitter size={20} className="text-blue-400" />
            </button>
            <button
              onClick={handleSocialSignUp}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Sign up with Facebook"
            >
              <FaFacebook size={20} className="text-blue-600" />
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-green-600 hover:text-green-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}