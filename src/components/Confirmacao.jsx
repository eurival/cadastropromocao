import React from 'react';
import Layout from './Layout';   // ⬅️ importa o default

export default function Confirmacao() {
  return (
    <Layout>
      <h2 className="text-center text-2xl font-bold mb-4">
        Obrigado pelo seu cadastro!
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Sua inscrição foi efetuada com sucesso. Em breve você receberá em seu e-mail as cortesias.
      </p>
    </Layout>
  );
}
