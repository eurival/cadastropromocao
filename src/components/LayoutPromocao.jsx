import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function LayoutPromocao() {
  const location = useLocation();
  const onConsulta = location.pathname.toLowerCase().includes('consulta');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1E1E1E] p-8 rounded shadow-lg w-full max-w-6xl text-white border-l-4 border-[#BF00FF]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex justify-center md:justify-start items-center">
          <img
            src="/logo.png"
            alt="CineX"
            className="h-16 drop-shadow-[0_0_20px_rgba(144,70,255,0.7)]"
          />
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <Link
              to="/cadastroPromocao"
              className={`px-4 py-2 rounded text-sm font-semibold border transition ${
                onConsulta
                  ? 'border-gray-700 bg-[#232323] hover:bg-[#2d2d2d]'
                  : 'border-[#BF00FF] bg-[#BF00FF] hover:bg-[#D100FF]'
              }`}
            >
              Novo cadastro
            </Link>
            <Link
              to="/consultaPromocao"
              className={`px-4 py-2 rounded text-sm font-semibold border transition ${
                onConsulta
                  ? 'border-[#BF00FF] bg-[#BF00FF] hover:bg-[#D100FF]'
                  : 'border-gray-700 bg-[#232323] hover:bg-[#2d2d2d]'
              }`}
            >
              Consultar cadastros
            </Link>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
