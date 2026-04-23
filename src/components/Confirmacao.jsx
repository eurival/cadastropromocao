// src/components/Confirmacao.jsx
import React from 'react';

export default function Confirmacao() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1E1E1E] p-8 rounded shadow-lg w-full max-w-md text-white border-l-4 border-[#BF00FF]">
        <div className="flex justify-center items-center mb-6">
          <img
            src="/logo.png"
            alt="CineX"
            className="h-16 drop-shadow-[0_0_20px_rgba(144,70,255,0.7)]"
          />
        </div>

        <h2 className="text-center text-2xl font-bold mb-4">
          Obrigado pelo seu cadastro!
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Sua inscrição foi efetuada com sucesso.
        </p>
      </div>
    </div>
  );
}
