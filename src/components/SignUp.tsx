"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  // Scroll to top when usernameNotification changes
  useEffect(() => {
    if (usernameNotification) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [usernameNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUsernameNotification(null);
    setIsLoading(true); // Start loading

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
      const generatedUsername = userData.username;

      // Show notification with the generated username
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

    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleGoogleSignUp = async () => {
    setError('Social sign-up is not supported at this time. Please use the form to sign up.');
  };

  const handleTwitterSignUp = async () => {
    setError('Social sign-up is not supported at this time. Please use the form to sign up.');
  };

  const handleFacebookSignUp = async () => {
    setError('Social sign-up is not supported at this time. Please use the form to sign up.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

        {usernameNotification && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded text-center">
            {usernameNotification}{' '}
            <Link href="/signin" className="text-green-600 hover:underline font-medium">
              Sign in now
            </Link>
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
          <div className="mb-4 relative">
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
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
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