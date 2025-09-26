// src/components/Confirmacao.jsx
import React from 'react';
// Não precisamos importar o Layout aqui, pois o App.jsx já cuida disso.

export default function Confirmacao() {
  return (
    // O componente agora retorna apenas o conteúdo, 
    // pois o App.jsx vai envolvê-lo com o LayoutCampelo.
    <>
      <h2 className="text-center text-2xl font-bold mb-4">
        Obrigado pelo seu cadastro!
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Sua inscrição foi efetuada com sucesso.
      </p>
    </>
  );
}