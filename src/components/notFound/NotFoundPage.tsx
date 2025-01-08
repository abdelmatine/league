import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg mb-8">The project link you're looking for doesn't exist or is invalid.</p>
      <button
        onClick={() => navigate('/')}
        className="bg-[#0AC8B9] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#088f81] transition duration-300"
      >
        Go Back to Home
      </button>
    </div>
  );
}
