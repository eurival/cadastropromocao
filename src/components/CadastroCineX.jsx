import React, { useState, useEffect } from 'react';
import { isValidCPF } from '../utils/cpf';
import { useNavigate } from 'react-router-dom';

// URLs de API
const API_BASE_URL = window.runtimeConfig.API_BASE_URL || ''; 

// URLs de API construídas a partir da base
const AUTH_URL = `${API_BASE_URL}/api/authenticate`;
const CADASTRO_URL = `${API_BASE_URL}/api/cadastropromocaos`;
const PROMO_URL = `${API_BASE_URL}/api/cadastropromocao-extended/promocaoValidada`;

export default function CadastroCineX() {
  const navigate = useNavigate();        // ← aqui!
  // Estados principais
  const [token, setToken] = useState('');         // Bearer token
  const [promoValid, setPromoValid] = useState(null); // null=pendente, true=ativa, false=encerrada
  //const [promoEnds, setPromoEnds] = useState('');  // data de encerramento
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '', cpf: '' });
  const [errors, setErrors] = useState({});

  // Ao montar: autentica e busca status da promoção
  useEffect(() => {
    async function init() {
      try {
        const username = window.runtimeConfig.API_USERNAME;
        const password = window.runtimeConfig.API_PASSWORD;
        if (!username || !password) {
          throw new Error("Credenciais da API não configuradas.");
        }
        // Autenticação
        const authRes = await fetch(AUTH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!authRes.ok) throw new Error('Falha na autenticação');
        const { id_token } = await authRes.json();
        setToken(id_token);
 
 
        // Checa o status da promoção
        const promoRes = await fetch(PROMO_URL, {
          headers: { 'Authorization': `Bearer ${id_token}` }
        });
        
        // O método .json() consegue interpretar uma resposta que é apenas 'true' ou 'false'.
        const isPromoValid = await promoRes.json(); 
        console.log('Promoção válida:', isPromoValid);
        // Define o estado diretamente com o valor booleano recebido.
        setPromoValid(isPromoValid);

        // Como este endpoint não retorna a data de encerramento,
        // você pode buscar essa informação de outro lugar se precisar.
        // Por agora, a mensagem de promoção encerrada não mostrará a data.
      } catch (err) {
        console.error(err);
        setPromoValid(false);
      }
    }
    init();
  }, []);

  // Handlers de formulário
  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handlePhoneChange = e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/, '($1) - $2').replace(/(\d{5})(\d)/, '$1-$2');
    setFormData(prev => ({ ...prev, telefone: v }));
  };
  const handleCPFChange = e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/^(\d{3})(\d)/, '$1.$2')
         .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
         .replace(/\.(\d{3})(\d)/, '.$1-$2');
    setFormData(prev => ({ ...prev, cpf: v }));
  };

  // Validação dos campos antes de enviar
  const validate = () => {
    const errs = {};
    if (!formData.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (!/^\(\d{2}\)\s-\s\d{5}-\d{4}$/.test(formData.telefone)) errs.telefone = 'Formato: (62) - 98139-6595';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Email inválido';
    if (!isValidCPF(formData.cpf)) errs.cpf = 'CPF inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submissão do formulário
  const handleSubmit = async e => {
    e.preventDefault();
    if (!promoValid) return;
    if (!validate()) return;
    try {
      const res = await fetch(CADASTRO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: formData.nome,
          fone: formData.telefone,
          email: formData.email,
          cpf: formData.cpf,
          cupomEnviado: false
        })
      });
      if (!res.ok) throw new Error('Falha no cadastro');
      navigate('/confirmacao');
      setFormData({ nome: '', telefone: '', email: '', cpf: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  // Renderização condicional
  if (promoValid === null) return <p className="text-white text-center mt-4">Verificando promoção...</p>;
  // CORREÇÃO: A mensagem agora não depende mais do estado 'promoEnds'.
  if (promoValid === false) return <p className="text-red-400 text-center mt-4">Desculpe, a promoção não está mais válida.</p>;

  // Formulário
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#121212] pt-4 px-4">
      <div className="bg-[#1E1E1E] p-8 rounded shadow-lg w-full max-w-md text-white border-l-4 border-[#BF00FF]">
        <img src="/logo.png" alt="CineX" className="h-16 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(144,70,255,0.7)]" />
        <h2 className="text-center text-2xl font-bold mb-4">Promoção de Férias CineX</h2>
        <p className="text-center mb-6 text-sm text-gray-300">Preencha e receba cortesias por e-mail!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium">Nome:</label>
            <input id="nome" name="nome" value={formData.nome} onChange={handleChange}
              className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.nome && <span className="text-red-600 text-sm">{errors.nome}</span>}
          </div>
          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium">Telefone:</label>
            <input id="telefone" name="telefone" value={formData.telefone} onChange={handlePhoneChange} placeholder="(62) - 98139-6595"
              className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.telefone && <span className="text-red-600 text-sm">{errors.telefone}</span>}
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">E-mail:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
              className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.email && <span className="text-red-600 text-sm">{errors.email}</span>}
          </div>
          {/* CPF */}
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium">CPF:</label>
            <input id="cpf" name="cpf" value={formData.cpf} onChange={handleCPFChange} placeholder="000.000.000-00"
              className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.cpf && <span className="text-red-600 text-sm">{errors.cpf}</span>}
          </div>
          <button type="submit" className="w-full bg-[#BF00FF] hover:bg-[#D100FF] text-white font-bold py-2 px-4 rounded transition">Enviar</button>
        </form>
      </div>
    </div>
  );
}
