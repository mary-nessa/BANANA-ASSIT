"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitter, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1: Split full name into firstName and lastName (already handled by separate fields)
    // Step 2: Call the /api/users/create endpoint
    try {
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
        throw new Error(errorData.message || 'Failed to create user');
      }

      const userData = await createResponse.json();
      const userId = userData.userID;
      const username = userData.username; // API generates username

      // Step 3: Automatically log in the user after signup using /api/users/login
      const loginResponse = await fetch('http://20.62.15.198:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to log in after signup');
      }

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Step 4: Store the token (e.g., in localStorage or a state management solution)
      localStorage.setItem('authToken', token);

      // Step 5: Redirect to home page after successful signup and login
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    }
  };

  const handleGoogleSignUp = async () => {
    await signIn('google', { callbackUrl: '/home' });
  };

  const handleTwitterSignUp = async () => {
    await signIn('twitter', { callbackUrl: '/home' });
  };

  const handleFacebookSignUp = async () => {
    await signIn('facebook', { callbackUrl: '/home' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-600 uppercase">Sign Up</h1>

        {error && (
          <div className="mb-4 text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
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
          <div className="mb-4">
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact">
              Contact
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="contact"
              type="text"
              placeholder="Contact (e.g., +256712345678)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Location
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="location"
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center mb-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg"
              type="submit"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="w-full mt-6">
          <p className="text-center text-gray-600 mb-4">Or sign up with</p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={handleGoogleSignUp}
              className="cursor-pointer text-3xl hover:opacity-80 transition-opacity"
              aria-label="Sign up with Google"
            >
              <FcGoogle />
            </button>
            <button
              onClick={handleTwitterSignUp}
              className="cursor-pointer text-3xl text-blue-500 hover:opacity-80 transition-opacity"
              aria-label="Sign up with Twitter"
            >
              <FaTwitter />
            </button>
            <button
              onClick={handleFacebookSignUp}
              className="cursor-pointer text-3xl text-blue-600 hover:opacity-80 transition-opacity"
              aria-label="Sign up with Facebook"
            >
              <FaFacebook />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="text-green-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}