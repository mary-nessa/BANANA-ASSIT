import { useState, useEffect } from 'react';

export interface AnalysisResult {
  result?: string;
  confidenceLevel?: number;
  processingTime?: number;
  remainingAttempts?: number;
  requiresSignup?: boolean;
  secondaryFindings?: {
    severity?: string;
    affectedArea?: string;
  } | string;
  varietyName?: string;
}

export const API_BASE_URL = "http://20.62.15.198:8080";

// Function to get a cookie value
function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

// Function to set a cookie
function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; secure; SameSite=Strict`;
}

// Auth hooks and utilities
export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userId: null as string | null,
    authToken: null as string | null,
    userRole: null as 'ADMIN' | 'USER' | null,
  });

  useEffect(() => {
    // Check cookies first, then fallback to localStorage
    const cookieToken = getCookie('authToken');
    const cookieRole = getCookie('userRole');
    
    const token = cookieToken || localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('userRole');
    const role = (cookieRole || storedRole) as 'ADMIN' | 'USER' | null;

    if (token && userId) {
      setAuthState({
        isAuthenticated: true,
        userId,
        authToken: token,
        userRole: role,
      });

      // Ensure both storage mechanisms are in sync
      if (!cookieToken) {
        setCookie('authToken', token);
      }
      if (!cookieRole && role) {
        setCookie('userRole', role);
      }
    }
  }, []);

  return authState;
};

// Guest user management
export const useGuestState = (type: 'disease' | 'variety') => {
  const [guestState, setGuestState] = useState({
    deviceID: '',
    attempts: 0,
    limitReached: false,
    requiresSignup: false,
  });

  useEffect(() => {
    const init = async () => {
      const deviceId = getStoredDeviceId();
      const usage = await checkDeviceUsage(deviceId, type);
      
      setGuestState({
        deviceID: deviceId,
        attempts: usage.attempts,
        limitReached: usage.limitReached,
        requiresSignup: usage.limitReached,
      });
    };

    init();
  }, [type]);

  return guestState;
};

// Utility functions
export const generateDeviceId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getStoredDeviceId = () => {
  let deviceId = localStorage.getItem('banana_disease_device_id');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('banana_disease_device_id', deviceId);
  }
  return deviceId;
};

export const handleFileValidation = (file: File | null) => {
  if (!file) return false;
  return file.type.startsWith('image/');
};

export const handleFileChange = (
  file: File,
  setSelectedImage: (file: File | null) => void,
  setError: (error: string | null) => void
) => {
  if (handleFileValidation(file)) {
    setSelectedImage(file);
    setError(null);
  } else {
    setError("Please select a valid image file.");
  }
};

// API and Response handling
export const checkDeviceUsage = async (deviceId: string, type: 'disease' | 'variety') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guest/${deviceId}`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        attempts: type === 'disease' ? data.diseaseAttempts : data.varietyAttempts,
        limitReached: data.limitReached,
        error: null
      };
    }
    return { attempts: 0, limitReached: false, error: 'Failed to check usage' };
  } catch (error) {
    console.error("Error checking device usage:", error);
    return { attempts: 0, limitReached: false, error: 'Network error' };
  }
};

export const processGuestResponse = (
  data: AnalysisResult,
  callbacks: {
    setAttempts: (n: number) => void,
    setLimitReached: (b: boolean) => void,
    setRequiresSignup: (b: boolean) => void,
    setShowModal: (b: boolean) => void,
    setError: (s: string | null) => void,
  }
) => {
  const { setAttempts, setLimitReached, setRequiresSignup, setShowModal, setError } = callbacks;
  
  setAttempts(3 - (data.remainingAttempts || 0));
  
  if (data.requiresSignup) {
    setRequiresSignup(true);
    setLimitReached(true);
    setShowModal(true);
    setError("You have reached the maximum number of attempts. Please sign in to continue.");
    return true;
  }
  
  return false;
};
