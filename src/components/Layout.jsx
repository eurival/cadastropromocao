// src/components/Layout.jsx
import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#121212] pt-4 px-4">
      <div className="bg-[#1E1E1E] p-8 rounded shadow-lg w-full max-w-md text-white border-l-4 border-[#BF00FF]">
        <img src="/logo.png" alt="CineX"
             className="h-16 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(144,70,255,0.7)]" />
        {children}
      </div>
    </div>
  );
}
