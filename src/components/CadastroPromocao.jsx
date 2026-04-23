import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns-tz';
import { getApiBaseUrl, getApiPassword, getApiUsername } from '../config/runtimeConfig';

const API_BASE_URL = getApiBaseUrl();
const AUTH_URL = `${API_BASE_URL}/api/authenticate`;
const CADASTRO_URL = `${API_BASE_URL}/api/cad-fun-lojas`;

function formatPhone(value) {
  let v = value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  return v.replace(/^(\d{2})(\d)/, '($1) - $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export default function CadastroPromocao() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    nomeConvidado: '',
    telefoneConvidado: '',
    loja: '',
    praca: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const praca = params.get('praca')?.trim() || '';

    setFormData(prev => ({ ...prev, praca }));
    if (praca) {
      setErrors(prev => ({ ...prev, praca: undefined }));
    }
  }, [location.search]);

  const ensureToken = async () => {
    if (token) return token;

    const username = getApiUsername();
    const password = getApiPassword();
    if (!username || !password) {
      throw new Error('Credenciais não configuradas.');
    }

    const authRes = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!authRes.ok) {
      throw new Error('Falha na autenticação.');
    }

    const { id_token } = await authRes.json();
    setToken(id_token);
    return id_token;
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handlePhoneChange = field => e => {
    const value = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (!/^\(\d{2}\)\s-\s\d{5}-\d{4}$/.test(formData.telefone)) errs.telefone = 'Formato: (99) - 99999-9999';
    if (!formData.nomeConvidado.trim()) errs.nomeConvidado = 'Nome do convidado é obrigatório';
    if (!/^\(\d{2}\)\s-\s\d{5}-\d{4}$/.test(formData.telefoneConvidado)) errs.telefoneConvidado = 'Formato: (99) - 99999-9999';
    if (!formData.loja.trim()) errs.loja = 'Loja que trabalha é obrigatória';
    if (!formData.praca.trim()) errs.praca = 'A praça precisa vir preenchida pelo link';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setAuthError('');
      setIsLoading(true);
      const authToken = await ensureToken();
      const dataCadastro = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'America/Sao_Paulo' });
      const res = await fetch(CADASTRO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          nome: formData.nome,
          fone: formData.telefone,
          nomeConvidado: formData.nomeConvidado,
          foneConvidado: formData.telefoneConvidado,
          dataCadastro,
          loja: formData.loja,
          praca: formData.praca
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Falha no cadastro. Tente novamente.');
      }

      navigate('/confirmacao');
      setFormData({
        nome: '',
        telefone: '',
        nomeConvidado: '',
        telefoneConvidado: '',
        loja: '',
        praca: formData.praca
      });
    } catch (err) {
      setAuthError(err.message || 'Erro ao enviar cadastro.');
    }
    setIsLoading(false);
  };

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

        <h2 className="text-center text-2xl font-bold mb-4">Cadastro Promoção</h2>
        <p className="text-center mb-6 text-sm text-gray-300">Preencha os dados para concluir sua participação.</p>
        {authError && <p className="mb-4 text-sm text-red-400 text-center">{authError}</p>}
        {!formData.praca && <p className="mb-4 text-sm text-red-400 text-center">Link inválido: a praça não foi informada.</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium">Nome:</label>
            <input id="nome" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.nome && <span className="text-red-600 text-sm">{errors.nome}</span>}
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium">Telefone:</label>
            <input id="telefone" name="telefone" value={formData.telefone} onChange={handlePhoneChange('telefone')} placeholder="(99) - 99999-9999" className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.telefone && <span className="text-red-600 text-sm">{errors.telefone}</span>}
          </div>
          <div>
            <label htmlFor="nomeConvidado" className="block text-sm font-medium">Nome do convidado:</label>
            <input id="nomeConvidado" name="nomeConvidado" value={formData.nomeConvidado} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.nomeConvidado && <span className="text-red-600 text-sm">{errors.nomeConvidado}</span>}
          </div>
          <div>
            <label htmlFor="telefoneConvidado" className="block text-sm font-medium">Telefone do convidado:</label>
            <input id="telefoneConvidado" name="telefoneConvidado" value={formData.telefoneConvidado} onChange={handlePhoneChange('telefoneConvidado')} placeholder="(99) - 99999-9999" className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.telefoneConvidado && <span className="text-red-600 text-sm">{errors.telefoneConvidado}</span>}
          </div>
          <div>
            <label htmlFor="loja" className="block text-sm font-medium">Loja que trabalha:</label>
            <input id="loja" name="loja" value={formData.loja} onChange={handleChange} className="mt-1 w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded focus:ring-2 focus:ring-[#BF00FF] text-white placeholder-gray-400" />
            {errors.loja && <span className="text-red-600 text-sm">{errors.loja}</span>}
          </div>
          <div>
            <label htmlFor="praca" className="block text-sm font-medium">Praça:</label>
            <input
              id="praca"
              name="praca"
              value={formData.praca}
              readOnly
              aria-readonly="true"
              className="mt-1 w-full px-4 py-2 bg-[#232323] border border-gray-700 rounded text-gray-300 cursor-not-allowed"
            />
            {errors.praca && <span className="text-red-600 text-sm">{errors.praca}</span>}
          </div>
          <button type="submit" disabled={!formData.praca || isLoading} className="w-full bg-[#BF00FF] hover:bg-[#D100FF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition">
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}
