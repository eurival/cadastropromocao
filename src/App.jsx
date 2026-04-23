import { Routes, Route } from "react-router-dom";
import LayoutCampelo from "./components/LayoutCampelo";
import LayoutPromocao from "./components/LayoutPromocao";
import CadastroCinex from "./components/CadastroCineX";
import CadastroPromocao from "./components/CadastroPromocao";
import ConsultaPromocao from "./components/ConsultaPromocao";
import Confirmacao from "./components/Confirmacao";
import CadastroCampelo from "./components/CadastroCampelo";

export default function App() {
  return (
    <Routes>
      <Route element={<LayoutCampelo />}>
        <Route path="/" element={<CadastroCampelo />} />
      </Route>

      <Route element={<LayoutPromocao />}>
        <Route path="/cadastroCinex" element={<CadastroCinex />} />
        <Route path="/consultaPromocao" element={<ConsultaPromocao />} />
        <Route path="/consultapromocao" element={<ConsultaPromocao />} />
      </Route>
      <Route path="/cadastroPromocao" element={<CadastroPromocao />} />
      <Route path="/cadastropromocao" element={<CadastroPromocao />} />
      <Route path="/confirmacao" element={<Confirmacao />} />
    </Routes>
  );
}
