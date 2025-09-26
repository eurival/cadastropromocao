import { Routes, Route } from "react-router-dom"; 
import LayoutCampelo from "./components/LayoutCampelo"; // <-- 1. IMPORTE O LAYOUT CORRETO
import CadastroCinex from "./components/CadastroCineX";
import Confirmacao from "./components/Confirmacao";
import CadastroCampelo from "./components/CadastroCampelo";

export default function App() {
  return (
    <Routes>
      {/* 2. USE O LayoutCampelo COMO A ROTA "PAI" */}
      <Route element={<LayoutCampelo />}>
        
        {/* As páginas abaixo serão renderizadas dentro do <Outlet /> do LayoutCampelo */}
        <Route path="/" element={<CadastroCampelo />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
        <Route path="/cadastroCinex" element={<CadastroCinex />} />
        
      </Route>
    </Routes>
  );
}