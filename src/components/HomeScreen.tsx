"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FiCamera, FiGrid, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/utils/analysis';

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Welcome to Banana Assist
            </h1>
            <p className="text-green-100 text-lg mb-6">
              Your AI-powered companion for banana farming excellence. Get instant disease detection, variety identification, and expert advice.
            </p>
            {!isAuthenticated && (
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Get Started
                <FiArrowRight className="ml-2" />
              </Link>
            )}
          </div>
          <div className="relative w-full md:w-1/2 h-48 md:h-64">
            <Image
              src="/images/splashscreenimg.jpeg"
              alt="Banana plants"
              fill
              className="rounded-lg object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Link href="/disease-detection" className="group">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full transform group-hover:-translate-y-1">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
              <FiCamera size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Disease Detection</h2>
            <p className="text-gray-600 mb-4">Upload photos of your banana plants and get instant AI-powered disease diagnosis.</p>
            <span className="text-green-600 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform">
              Try it now <FiArrowRight className="ml-1" />
            </span>
          </div>
        </Link>

        <Link href="/variety-identification" className="group">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full transform group-hover:-translate-y-1">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
              <FiGrid size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Variety Identification</h2>
            <p className="text-gray-600 mb-4">Identify banana varieties with our advanced image recognition system.</p>
            <span className="text-green-600 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform">
              Explore varieties <FiArrowRight className="ml-1" />
            </span>
          </div>
        </Link>

        <Link href="/chatbot" className="group">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full transform group-hover:-translate-y-1">
            <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
              <FiMessageSquare size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">AI Chatbot</h2>
            <p className="text-gray-600 mb-4">Get instant answers and expert advice for all your banana farming questions.</p>
            <span className="text-green-600 font-medium inline-flex items-center group-hover:translate-x-1 transition-transform">
              Start chatting <FiArrowRight className="ml-1" />
            </span>
          </div>
        </Link>
      </div>

      {/* How It Works Section */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Upload Photo</h3>
            <p className="text-gray-600">Take or upload a photo of your banana plant or fruit.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">AI Analysis</h3>
            <p className="text-gray-600">Our AI system analyzes the image for diseases or variety identification.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Get Results</h3>
            <p className="text-gray-600">Receive detailed analysis and recommendations instantly.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-green-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our community of banana farmers and get access to all our AI-powered tools.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}