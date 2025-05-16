'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mt-4 text-gray-600">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Try Again
      </button>
    </div>
  );
}