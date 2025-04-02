// components/UploadProgress.tsx
"use client";

import { useState, useEffect } from 'react';

export default function UploadProgress() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');

  useEffect(() => {
    const handleUploadStart = () => {
      console.log('Upload started');
      setIsVisible(true);
      setProgress(0);
      setStatus('uploading');
    };

    const handleProgress = (event: CustomEvent) => {
      console.log('Upload progress:', event.detail.progress);
      setProgress(event.detail.progress);
      setStatus(event.detail.progress >= 100 ? 'processing' : 'uploading');
    };

    const handleComplete = () => {
      console.log('Upload complete');
      setProgress(100);
      setStatus('complete');
      setTimeout(() => {
        setIsVisible(false);
        setStatus('idle');
      }, 1500);
    };

    const handleError = () => {
      console.log('Upload error');
      setStatus('complete');
      setTimeout(() => setIsVisible(false), 1500);
    };

    // Add event listeners
    window.addEventListener('upload-start', handleUploadStart as EventListener);
    window.addEventListener('upload-progress', handleProgress as EventListener);
    window.addEventListener('upload-complete', handleComplete as EventListener);
    window.addEventListener('upload-error', handleError as EventListener);

    return () => {
      window.removeEventListener('upload-start', handleUploadStart as EventListener);
      window.removeEventListener('upload-progress', handleProgress as EventListener);
      window.removeEventListener('upload-complete', handleComplete as EventListener);
      window.removeEventListener('upload-error', handleError as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  const statusMessages = {
    uploading: `Uploading: ${Math.round(progress)}%`,
    processing: 'Processing...',
    complete: 'Done!',
    idle: ''
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000]">
      <div className="h-1.5 bg-gray-100 w-full">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            status === 'complete' ? 'bg-green-500' : 'bg-green-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-center py-1 bg-gray-50 text-gray-700">
        {statusMessages[status]}
      </div>
    </div>
  );
}