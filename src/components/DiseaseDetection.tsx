"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCamera, FaUpload, FaCheck, FaHome } from 'react-icons/fa';
import {
  API_BASE_URL,
  AnalysisResult,
  useAuth,
  useGuestState,
  handleFileChange,
  processGuestResponse
} from '@/utils/analysis';

export default function DiseaseDetection() {
  // Basic state management
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [diagnosis, setDiagnosis] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Auth state from custom hook
  const { isAuthenticated, userId, authToken } = useAuth();
  
  // Guest state management
  const [diseaseAttempts, setDiseaseAttempts] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [requiresSignup, setRequiresSignup] = useState(false);
  const { deviceID } = useGuestState('disease');

  const handleTakePhoto = () => {
    alert("Camera functionality will open your device camera when implemented.");
  };  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file, setSelectedImage, setError);
      setDiagnosis(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file, setSelectedImage, setError);
      setDiagnosis(null);
    }
  };
  const handleSubmit = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('imageFile', selectedImage);

      let response;

      if (isAuthenticated) {
        // Authenticated user: Use /api/diagnoses/create
        if (!userId || !authToken) {
          throw new Error("User authentication data missing.");
        }

        formData.append('userId', userId);
        response = await fetch(`${API_BASE_URL}/api/diagnoses/create`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please sign in again.");
          } else if (response.status === 404) {
            throw new Error("User not found.");
          }
          throw new Error(`Failed to create diagnosis: ${response.status}`);
        }

        // /api/diagnoses/create returns an empty response on success
        // Fetch the diagnosis result using /api/diagnoses/user/{userId}
        const diagnosisResponse = await fetch(`${API_BASE_URL}/api/diagnoses/user/${userId}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });

        if (!diagnosisResponse.ok) {
          throw new Error(`Failed to fetch diagnosis: ${diagnosisResponse.status}`);
        }

        const diagnosisData = await diagnosisResponse.json();
        const latestDiagnosis = diagnosisData[diagnosisData.length - 1]; // Get the most recent diagnosis
        setDiagnosis({
          result: latestDiagnosis.diseaseName,
          confidenceLevel: latestDiagnosis.confidenceLevel,
          processingTime: latestDiagnosis.processingTime,
          secondaryFindings: latestDiagnosis.secondaryFindings,
        });      
      } else {
        // Guest user: Use /api/diagnoses/analyze
        formData.append('deviceId', deviceID);
        response = await fetch(`${API_BASE_URL}/api/diagnoses/analyze`, {
          method: "POST",
          body: formData,
        });        const data = await response.json();
        console.log("Diagnosis data:", data);
        
        const limitReached = processGuestResponse(data, {
          setAttempts: setDiseaseAttempts,
          setLimitReached,
          setRequiresSignup,
          setShowModal,
          setError
        });

        if (limitReached) return;

        if (!response.ok) {
          throw new Error(`Failed to analyze image: ${response.status}`);
        }

        setDiagnosis(data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-green-600">Banana Disease Detection</h1>
          <Link href="/home" className="flex items-center text-green-600 hover:text-green-800 transition-colors">
            <FaHome className="mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Banana Leaf Image</h2>

            {!isAuthenticated && limitReached && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                <p className="text-yellow-700 font-medium">
                  You have reached the maximum number of disease detection attempts ({diseaseAttempts}/3).
                  <span>
                    {' '}Please{' '}
                    <Link href="/suth/signin" className="text-green-600 hover:underline">sign in</Link>
                    {' '}or{' '}
                    <Link href="/auth/signup" className="text-green-600 hover:underline">sign up</Link>
                    {' '}to continue.
                  </span>
                </p>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              className={`w-full h-64 border-2 ${
                isDragging ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'
              } rounded-lg p-4 mb-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                !isAuthenticated && limitReached ? 'opacity-50 pointer-events-none' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >              {selectedImage ? (
                <>
                  <div className="relative h-48 w-full">
                    <Image
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected banana leaf"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Click or drag to change image</p>
                </>
              ) : (
                <>
                  <FaUpload className="text-4xl text-green-500 mb-3" />
                  <p className="text-gray-600 mb-1">
                    {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </>
              )}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadImage}
                disabled={!isAuthenticated && limitReached}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleTakePhoto}
                disabled={!isAuthenticated && limitReached}
                className={`flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors ${
                  !isAuthenticated && limitReached ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCamera />
                <span>Take Photo</span>
              </button>

              <button
                onClick={() => document.getElementById('fileInput')?.click()}
                disabled={!isAuthenticated && limitReached}
                className={`flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors ${
                  !isAuthenticated && limitReached ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaUpload />
                <span>Upload Image</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || isLoading || (!isAuthenticated && limitReached)}
              className={`w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors ${
                !selectedImage || isLoading || (!isAuthenticated && limitReached) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <FaCheck />
                  Analyze Image
                </>
              )}
            </button>

            {/* Usage Info */}
            {!isAuthenticated && (
              <div className="mt-4 text-sm text-gray-500">
                <p>Disease detection attempts: {diseaseAttempts}/3</p>
                {requiresSignup && (
                  <p className="text-green-600 mt-2">
                    Want unlimited access?{' '}
                    <Link href="/signup" className="font-semibold hover:underline">Sign up now</Link>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Results & Info */}
          <div className="space-y-6">
            {/* Diagnosis Result */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Diagnosis</h2>
              {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              {diagnosis ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Diagnosis Result:</h3>
                  <div className="space-y-2 text-gray-800">
                    <p><span className="font-bold">Result:</span> {diagnosis.result || 'N/A'}</p>
                    <p><span className="font-bold">Confidence Level:</span> {diagnosis.confidenceLevel ? `${diagnosis.confidenceLevel}%` : 'N/A'}</p>
                    <p><span className="font-bold">Processing Time:</span> {diagnosis.processingTime ? `${diagnosis.processingTime}ms` : 'N/A'}</p>
                    {diagnosis.secondaryFindings && (
                      <>
                        {typeof diagnosis.secondaryFindings === 'string' ? (
                          <p><span className="font-bold">Additional Findings:</span> {diagnosis.secondaryFindings}</p>
                        ) : (
                          <>
                            <p><span className="font-bold">Severity:</span> {diagnosis.secondaryFindings.severity || 'N/A'}</p>
                            <p><span className="font-bold">Affected Area:</span> {diagnosis.secondaryFindings.affectedArea || 'N/A'}</p>
                          </>
                        )}
                      </>
                    )}
                    {!isAuthenticated && diagnosis.remainingAttempts !== undefined && (
                      <p><span className="font-bold">Remaining Attempts:</span> {diagnosis.remainingAttempts}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No diagnosis yet. Upload an image and click &quot;Analyze Image&quot; to get started.</p>
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Tips for Best Results</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Take photos in good lighting conditions
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Focus on affected leaves (if any)
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Avoid shadows on the leaves
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Capture both sides of the leaf if possible
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal for Sign-In/Sign-Up Prompt */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Limit Reached</h2>
              <p className="text-gray-600 mb-6">
                You have reached the maximum number of disease detection attempts (3/3). Please sign in or sign up to continue.
              </p>
              <div className="flex justify-between gap-4">
                <Link href="/auth/signin">
                  <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full">
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full">
                    Sign Up
                  </button>
                </Link>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 text-gray-600 hover:underline w-full text-center"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}