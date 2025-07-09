// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CadastroCineX from "./components/CadastroCineX";
import Confirmacao from "./components/Confirmacao";

export default function App() {
  return (
 
      <Routes>
        <Route path="/" element={<CadastroCineX />} />
        <Route path="/confirmacao" element={<Confirmacao />} />
      </Routes>
 
  );
}
