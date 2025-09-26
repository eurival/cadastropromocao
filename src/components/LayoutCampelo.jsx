import React from 'react';
import { Outlet } from 'react-router-dom';

export default function LayoutCampelo() {
  return (
    // 1. Container principal volta a ser simples: apenas centraliza o card.
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">

      {/* O card do formulário */}
      <div className="bg-[#1E1E1E] p-8 rounded shadow-lg w-full max-w-md text-white border-l-4 border-[#BF00FF]">

        {/* 2. NOVO CONTAINER PARA OS LOGOS (DENTRO DO CARD) */}
        {/* Este container usa flexbox para alinhar os logos lado a lado */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          
          {/* Logo 1: CineX */}
          <img
            src="/logo.png"
            alt="CineX"
            className="h-16 drop-shadow-[0_0_20px_rgba(144,70,255,0.7)]"
          />

          {/* Logo 2: Campelo */}
          <img
            src="/logocampelo.png"
            alt="Campelo"
            className="h-12" // Deixei um pouco menor para dar destaque ao CineX, mas você pode usar h-16 se preferir
          />

        </div>

        {/* O Outlet renderiza o conteúdo do formulário (h2, inputs, etc.) aqui */}
        <Outlet />
        
      </div>
    </div>
  );
}