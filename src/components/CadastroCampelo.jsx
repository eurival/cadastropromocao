import React, { useState, useEffect } from 'react';
import { isValidCPF } from '../utils/cpf';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns-tz';

const AUTH_URL = '/api/authenticate';
const CADASTRO_URL = '/api/cadastropromocaos';

export default function CadastroCampelo() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // 1. CORREÇÃO: Removido 'email' do estado inicial
  const [formData, setFormData] = useState({ nome: '', telefone: '', cpf: '' });
  const [errors, setErrors] = useState({});
   
  useEffect(() => {
    async function init() {
      try {
        const username = window.runtimeConfig.API_USERNAME;
        const password = window.runtimeConfig.API_PASSWORD;
        if (!username || !password) throw new Error("Credenciais não configuradas.");

        const authRes = await fetch(AUTH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (!authRes.ok) throw new Error('Falha na autenticação');
        const { id_token } = await authRes.json();
        setToken(id_token);
      } catch (err) {
        console.error("Erro na inicialização:", err);
        alert("Erro ao inicializar a página. Verifique o console.");
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
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
    v = v.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
    setFormData(prev => ({ ...prev, cpf: v }));
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (!/^\(\d{2}\)\s-\s\d{5}-\d{4}$/.test(formData.telefone)) errs.telefone = 'Formato: (99) - 99999-9999';
    // 2. CORREÇÃO: Removida a linha de validação do e-mail
    if (!isValidCPF(formData.cpf)) errs.cpf = 'CPF inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
     // const cpfLimpo = formData.cpf.replace(/\D/g, '');
      const checkCpfUrl = `${CADASTRO_URL}?cpf.contains=${formData.cpf}&local.contains=Campelo`;
      console.log("Verificando CPF com URL:", checkCpfUrl);
      
      const checkCpfRes = await fetch(checkCpfUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!checkCpfRes.ok) {
        throw new Error('Erro ao verificar o CPF. Tente novamente.');
      }

      const existingUsers = await checkCpfRes.json();

      if (existingUsers && existingUsers.length > 0) {
        setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado em nossa base de dados.' }));
        return;
      }      

      const dataDeCadastro = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'America/Sao_Paulo' });

      const res = await fetch(CADASTRO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          nome: formData.nome,
          fone: formData.telefone,
          email: "null",
          local: "Campelo",
          cpf: formData.cpf,
          cupomEnviado: false,
          dataCadastro: dataDeCadastro
        })
      });
      
      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.detail || 'Falha no cadastro. Tente novamente.');
      }

      navigate('/confirmacao');
      setFormData({ nome: '', telefone: '', cpf: '' }); // 'email' também removido daqui
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <p className="text-white text-center mt-4">Carregando...</p>;

  
  return (
    // Usamos um Fragment (<>) pois o Layout.jsx já cria todas as divs externas.
    // Este componente agora retorna APENAS o conteúdo do formulário.
    <>
      <h2 className="text-center text-2xl font-bold mb-4">Promoção Campelo / CineX</h2>
      <p className="text-center mb-6 text-sm text-gray-300">Preencha o formulário para participar!</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium">Nome:</label>
          <input id="nome" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
          {errors.nome && <span className="text-red-600 text-sm">{errors.nome}</span>}
        </div>
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium">Telefone:</label>
          <input id="telefone" name="telefone" value={formData.telefone} onChange={handlePhoneChange} placeholder="(99) - 99999-9999" className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
          {errors.telefone && <span className="text-red-600 text-sm">{errors.telefone}</span>}
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium">CPF:</label>
          <input id="cpf" name="cpf" value={formData.cpf} onChange={handleCPFChange} placeholder="000.000.000-00" className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
          {errors.cpf && <span className="text-red-600 text-sm">{errors.cpf}</span>}
        </div>
        <button type="submit" className="w-full bg-[#BF00FF] hover:bg-[#D100FF] text-white font-bold py-2 px-4 rounded transition">Enviar</button>
      </form>
    </>
  );
}