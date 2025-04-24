"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaCamera, FaUpload, FaCheck, FaHome } from 'react-icons/fa';

export default function VarietyIdentification() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [variety, setVariety] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Device tracking state for guest users
  const [deviceID, setDeviceID] = useState<string>("");
  const [varietyAttempts, setVarietyAttempts] = useState<number>(0);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [requiresSignup, setRequiresSignup] = useState<boolean>(false);

  // Authenticated user state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // API Base URL
  const API_BASE_URL = "http://20.62.15.198:8080";

  // Check authentication and device ID on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
      setIsAuthenticated(true);
      setAuthToken(token);
      setUserId(storedUserId);
    } else {
      const generateDeviceId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      let storedDeviceID = localStorage.getItem('banana_disease_device_id');
      if (!storedDeviceID) {
        storedDeviceID = generateDeviceId();
        localStorage.setItem('banana_disease_device_id', storedDeviceID);
      }

      setDeviceID(storedDeviceID);
      checkDeviceUsage(storedDeviceID);
      checkVarietyLimit(storedDeviceID);
    }

    return () => {
      stopCamera();
    };
  }, []);

  // Function to check device usage from API (for guest users)
  const checkDeviceUsage = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guest/${id}`, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("Access denied. Please sign in to continue.");
          setLimitReached(true);
          setRequiresSignup(true);
          setShowModal(true);
        } else if (response.status === 404) {
          setVarietyAttempts(0);
        } else {
          setError(`Failed to check device usage: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      setVarietyAttempts(data.varietyAttempts || 0);
    } catch (error) {
      console.error("Error checking device usage:", error);
      setError("Network error. Please check your connection and try again.");
    }
  };

  // Function to check if device has reached variety identification limit
  const checkVarietyLimit = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guest/variety/limit/${id}`, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("Access denied. Please sign in to continue.");
          setLimitReached(true);
          setRequiresSignup(true);
          setShowModal(true);
        } else {
          setError(`Failed to check variety limit: ${response.status}`);
        }
        return;
      }

      const limitStatus = await response.json();
      setLimitReached(limitStatus.limitReached === true);
      if (limitStatus.limitReached) {
        setRequiresSignup(true);
        setShowModal(true);
        setError("You have reached the maximum number of variety identification attempts (3/3). Please sign in or sign up to continue.");
      }
    } catch (error) {
      console.error("Error checking variety limit:", error);
      setError("Network error. Please check your connection and try again.");
    }
  };

  // Camera functions
  const startCamera = async () => {
    if (!isAuthenticated && limitReached) {
      setError("Guest limit reached. Please sign in to use the camera.");
      setShowModal(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
        streamRef.current = stream;
        setIsCameraOpen(true);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let errorMessage = "Failed to access camera. Please ensure camera permissions are granted.";
      if (err.name === 'NotAllowedError') {
        errorMessage = "Camera access denied. Please allow camera permissions in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found. Please upload an image instead.";
      }
      setError(errorMessage);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedImage(file);
          setVariety(null);
          setError(null);
          stopCamera();
        } else {
          setError("Failed to capture photo. Please try again.");
        }
      }, 'image/jpeg', 0.9);
    } else {
      setError("Camera is not ready. Please try again or upload an image.");
    }
  };

  const handleTakePhoto = () => {
    if (!isCameraOpen) {
      startCamera();
    }
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setVariety(null);
      setError(null);
    }
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileChange(file);
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
    if (file) handleFileChange(file);
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    if (!isAuthenticated && limitReached) {
      setError("You have reached the maximum number of variety identification attempts. Please sign in to continue.");
      setRequiresSignup(true);
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('imageFile', selectedImage);

      let response;

      if (isAuthenticated) {
        if (!userId || !authToken) {
          throw new Error("User authentication data missing.");
        }

        formData.append('userId', userId);
        response = await fetch(`${API_BASE_URL}/api/varieties/create`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Authentication failed. Please sign in again.");
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            setIsAuthenticated(false);
            setShowModal(true);
          } else if (response.status === 403) {
            setError("You do not have permission to perform this action.");
          } else if (response.status === 404) {
            setError("User not found.");
          }
          throw new Error(`Failed to create variety identification: ${response.status}`);
        }

        const varietyResponse = await fetch(`${API_BASE_URL}/api/varieties/user/${userId}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });

        if (!varietyResponse.ok) {
          throw new Error(`Failed to fetch variety identification: ${varietyResponse.status}`);
        }

        const varietyData = await varietyResponse.json();
        const latestVariety = varietyData[varietyData.length - 1];
        setVariety({
          result: latestVariety.varietyName,
          confidenceLevel: latestVariety.confidenceLevel,
          processingTime: latestVariety.processingTime,
        });
      } else {
        formData.append('deviceId', deviceID);
        response = await fetch(`${API_BASE_URL}/api/varieties/analyze`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 403 || response.status === 400) {
            setLimitReached(true);
            setRequiresSignup(true);
            setShowModal(true);
            setError("You have reached the maximum number of variety identification attempts (3/3). Please sign in or sign up to continue.");
            return;
          }
          throw new Error(`Failed to analyze image: ${response.status}`);
        }

        const data = await response.json();
        setVariety({
          result: data.varietyName,
          confidenceLevel: data.confidenceLevel,
          processingTime: data.processingTime,
        });
        setVarietyAttempts(3 - (data.remainingAttempts || 0));

        if (data.limitReached || data.requiresSignup) {
          setRequiresSignup(true);
          setLimitReached(true);
          setShowModal(true);
          setError("You have reached the maximum number of variety identification attempts (3/3). Please sign in or sign up to continue.");
        }
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
          <h1 className="text-2xl md:text-3xl font-bold text-green-600">Banana Variety Identification</h1>
          <Link href="/home" className="flex items-center text-green-600 hover:text-green-800 transition-colors">
            <FaHome className="mr-2" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Banana Image</h2>

            {!isAuthenticated && limitReached && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                <p className="text-yellow-700 font-medium">
                  You have reached the maximum number of variety identification attempts ({varietyAttempts}/3).
                  <span>
                    {' '}Please{' '}
                    <Link href="/signin" className="text-green-600 hover:underline">sign in</Link>
                    {' '}or{' '}
                    <Link href="/signup" className="text-green-600 hover:underline">sign up</Link>
                    {' '}to continue.
                  </span>
                </p>
              </div>
            )}

            {isCameraOpen ? (
              <div className="w-full h-64 bg-black rounded-lg overflow-hidden mb-4 relative">
                <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                {error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center p-2">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`w-full h-64 border-2 ${
                  isDragging ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'
                } rounded-lg p-4 mb-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  !isAuthenticated && limitReached ? 'opacity-50 pointer-events-none' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !(!isAuthenticated && limitReached) && document.getElementById('fileInput')?.click()}
              >
                {selectedImage ? (
                  <>
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Selected"
                      className="max-h-48 max-w-full object-contain rounded-lg mb-2"
                    />
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
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleTakePhoto}
                disabled={(!isAuthenticated && limitReached) || isCameraOpen}
                className={`flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors ${
                  (!isAuthenticated && limitReached) || isCameraOpen ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCamera />
                <span>Take Photo</span>
              </button>

              {isCameraOpen && (
                <>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaCamera />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span>Stop Camera</span>
                  </button>
                </>
              )}

              {!isCameraOpen && (
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
              )}
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
                <p>Variety identification attempts: {varietyAttempts}/3</p>
                {requiresSignup && (
                  <p className="text-green-600 mt-2">
                    Want unlimited access?{' '}
                    <Link href="/signup" className="font-semibold hover:underline">Sign up now</Link>
                  </p>
                )}
              </div>
            )}

            {/* Hidden Canvas for Capturing Photo */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Right Column - Results & Info */}
          <div className="space-y-6">
            {/* Variety Result */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Identification</h2>
              {error && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              {variety ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Identification Result:</h3>
                  <div className="space-y-2 text-gray-800">
                    <p><span className="font-bold">Result:</span> {variety.result || 'N/A'}</p>
                    <p><span className="font-bold">Confidence Level:</span> {variety.confidenceLevel ? `${variety.confidenceLevel}%` : 'N/A'}</p>
                    <p><span className="font-bold">Processing Time:</span> {variety.processingTime ? `${variety.processingTime}ms` : 'N/A'}</p>
                    {!isAuthenticated && variety.remainingAttempts !== undefined && (
                      <p><span className="font-bold">Remaining Attempts:</span> {variety.remainingAttempts}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No identification yet. Upload an image or take a photo and click "Analyze Image" to get started.</p>
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Tips for Best Results</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Take clear photos of the whole banana bunch
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Include close-ups of individual bananas
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Capture the banana flower if possible
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Include a reference object for scale
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal for Sign-In/Sign-Up Prompt */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Guest Limit Reached</h2>
              <p className="text-gray-600 mb-6">
                You've used all 3 guest attempts for variety identification. Sign in or create an account to enjoy unlimited access!
              </p>
              <div className="flex justify-between gap-4">
                <Link href="/signin">
                  <button className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors w-full font-semibold">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full font-semibold">
                    Sign Up
                  </button>
                </Link>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 text-gray-600 hover:underline w-full text-center text-sm"
              >
                Continue as Guest (Limited)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}