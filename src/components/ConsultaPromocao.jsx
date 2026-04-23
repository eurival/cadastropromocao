import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns-tz';
import { getApiBaseUrl, getApiPassword, getApiUsername } from '../config/runtimeConfig';
import { downloadPdf, downloadXlsx, formatDateTime } from '../utils/promocaoExports';

const API_BASE_URL = getApiBaseUrl();
const AUTH_URL = `${API_BASE_URL}/api/authenticate`;
const CADASTRO_URL = `${API_BASE_URL}/api/cad-fun-lojas`;
const TIME_ZONE = 'America/Sao_Paulo';
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const EMPTY_FILTERS = {
  nome: '',
  fone: '',
  nomeConvidado: '',
  foneConvidado: '',
  loja: '',
  praca: '',
  dataInicio: '',
  dataFim: ''
};

function buildCriteriaParams(filters) {
  const params = new URLSearchParams();

  if (filters.nome) params.set('nome.contains', filters.nome);
  if (filters.fone) params.set('fone.contains', filters.fone);
  if (filters.nomeConvidado) params.set('nomeConvidado.contains', filters.nomeConvidado);
  if (filters.foneConvidado) params.set('foneConvidado.contains', filters.foneConvidado);
  if (filters.loja) params.set('loja.contains', filters.loja);
  if (filters.praca) params.set('praca.contains', filters.praca);

  if (filters.dataInicio) params.set('dataCadastro.greaterThanOrEqual', `${filters.dataInicio}T00:00:00-03:00`);
  if (filters.dataFim) params.set('dataCadastro.lessThanOrEqual', `${filters.dataFim}T23:59:59-03:00`);

  return params;
}

function buildUrl(filters, page, size, sortField, sortOrder) {
  const params = buildCriteriaParams(filters);
  params.set('page', String(page));
  params.set('size', String(size));
  params.set('sort', `${sortField},${sortOrder}`);
  return `${CADASTRO_URL}?${params.toString()}`;
}

function buildCountUrl(filters) {
  const params = buildCriteriaParams(filters);
  return `${CADASTRO_URL}/count?${params.toString()}`;
}

function buildFilterSummary(filters) {
  const parts = [];
  if (filters.nome) parts.push(`Nome: ${filters.nome}`);
  if (filters.fone) parts.push(`Telefone: ${filters.fone}`);
  if (filters.nomeConvidado) parts.push(`Convidado: ${filters.nomeConvidado}`);
  if (filters.foneConvidado) parts.push(`Fone convidado: ${filters.foneConvidado}`);
  if (filters.loja) parts.push(`Loja: ${filters.loja}`);
  if (filters.praca) parts.push(`Praça: ${filters.praca}`);
  if (filters.dataInicio || filters.dataFim) {
    const periodo = `${filters.dataInicio || 'início'} até ${filters.dataFim || 'fim'}`;
    parts.push(`Período: ${periodo}`);
  }
  return parts.join(' | ');
}

function formatSortLabel(sortField, sortOrder, field, label) {
  if (sortField !== field) return label;
  return `${label} ${sortOrder === 'asc' ? '▲' : '▼'}`;
}

export default function ConsultaPromocao() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState('dataCadastro');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  const fetchPage = async ({
    nextPage = page,
    nextPageSize = pageSize,
    nextSortField = sortField,
    nextSortOrder = sortOrder,
    nextFilters = filters,
    authToken = token
  } = {}) => {
    if (!authToken) return;

    setTableLoading(true);
    setError('');

    try {
      const [listRes, countRes] = await Promise.all([
        fetch(buildUrl(nextFilters, nextPage, nextPageSize, nextSortField, nextSortOrder), {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch(buildCountUrl(nextFilters), {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);

      if (!listRes.ok) throw new Error('Falha ao carregar a lista.');
      if (!countRes.ok) throw new Error('Falha ao carregar o total de registros.');

      const list = await listRes.json();
      const total = await countRes.json();

      setRows(list);
      setTotalItems(Number(total) || list.length);
      setPage(nextPage);
      setPageSize(nextPageSize);
      setSortField(nextSortField);
      setSortOrder(nextSortOrder);
      setFilters(nextFilters);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao consultar registros.');
      setRows([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const username = getApiUsername();
        const password = getApiPassword();
        if (!username || !password) throw new Error('Credenciais da API não configuradas.');

        const authRes = await fetch(AUTH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!authRes.ok) throw new Error('Falha na autenticação.');
        const { id_token } = await authRes.json();
        setToken(id_token);
        await fetchPage({ authToken: id_token, nextPage: 0, nextPageSize: DEFAULT_PAGE_SIZE });
      } catch (err) {
        console.error('Erro na consulta:', err);
        setError(err.message || 'Erro ao inicializar a consulta.');
      } finally {
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDraftChange = event => {
    const { name, value } = event.target;
    setDraftFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async event => {
    event?.preventDefault?.();
    await fetchPage({ nextPage: 0, nextPageSize: pageSize, nextFilters: draftFilters });
  };

  const handleClearFilters = async () => {
    setDraftFilters(EMPTY_FILTERS);
    await fetchPage({ nextPage: 0, nextPageSize: pageSize, nextFilters: EMPTY_FILTERS });
  };

  const handleSort = async field => {
    const nextSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    await fetchPage({
      nextPage: 0,
      nextSortField: field,
      nextSortOrder,
      nextPageSize: pageSize,
      nextFilters: filters
    });
  };

  const handlePageSizeChange = async event => {
    const nextPageSize = Number(event.target.value);
    await fetchPage({
      nextPage: 0,
      nextPageSize,
      nextFilters: filters,
      nextSortField: sortField,
      nextSortOrder: sortOrder
    });
  };

  const handlePageChange = async nextPage => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
    await fetchPage({
      nextPage,
      nextPageSize: pageSize,
      nextFilters: filters,
      nextSortField: sortField,
      nextSortOrder: sortOrder
    });
  };

  const fetchAllRecords = async exportToken => {
    const batchSize = 100;
    let currentPage = 0;
    let accumulated = [];

    while (true) {
      const res = await fetch(buildUrl(filters, currentPage, batchSize, sortField, sortOrder), {
        headers: { Authorization: `Bearer ${exportToken}` }
      });

      if (!res.ok) throw new Error('Falha ao exportar os registros.');

      const data = await res.json();
      accumulated = accumulated.concat(data);

      if (data.length < batchSize) break;
      currentPage += 1;
    }

    return accumulated;
  };

  const handleExportExcel = async () => {
    if (!token) return;
    setTableLoading(true);
    try {
      const allRows = await fetchAllRecords(token);
      const timestamp = format(new Date(), 'yyyyMMdd-HHmmss', { timeZone: TIME_ZONE });
      downloadXlsx(allRows, `cadastros-promocao-${timestamp}.xlsx`);
    } catch (err) {
      alert(err.message || 'Falha ao exportar para Excel.');
    } finally {
      setTableLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!token) return;
    setTableLoading(true);
    try {
      const allRows = await fetchAllRecords(token);
      const timestamp = format(new Date(), 'yyyyMMdd-HHmmss', { timeZone: TIME_ZONE });
      downloadPdf(allRows, `cadastros-promocao-${timestamp}.pdf`, {
        praca: filters.praca,
        nome: filters.nome,
        loja: filters.loja,
        periodo: filters.dataInicio || filters.dataFim ? `${filters.dataInicio || 'início'} até ${filters.dataFim || 'fim'}` : ''
      });
    } catch (err) {
      alert(err.message || 'Falha ao exportar para PDF.');
    } finally {
      setTableLoading(false);
    }
  };

  const from = totalItems === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalItems);

  if (loading) {
    return <p className="text-white text-center mt-4">Carregando consulta...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-center md:text-left text-2xl font-bold">Consulta de Cadastros</h2>
          <p className="text-center md:text-left text-sm text-gray-300">
            Filtre, pagine e exporte os cadastros da promoção.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          <button
            type="button"
            onClick={() => navigate('/cadastroPromocao')}
            className="px-4 py-2 rounded border border-gray-700 bg-[#232323] hover:bg-[#2d2d2d] text-sm transition"
          >
            Novo cadastro
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={tableLoading || rows.length === 0}
            className="px-4 py-2 rounded bg-[#1f7a3f] hover:bg-[#239647] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={tableLoading || rows.length === 0}
            className="px-4 py-2 rounded bg-[#c0392b] hover:bg-[#e74c3c] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleApplyFilters} className="bg-[#171717] border border-gray-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              value={draftFilters.nome}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
              placeholder="Buscar por nome"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="fone">
              Telefone
            </label>
            <input
              id="fone"
              name="fone"
              value={draftFilters.fone}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
              placeholder="Telefone"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="nomeConvidado">
              Nome do convidado
            </label>
            <input
              id="nomeConvidado"
              name="nomeConvidado"
              value={draftFilters.nomeConvidado}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
              placeholder="Buscar por convidado"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="foneConvidado">
              Telefone do convidado
            </label>
            <input
              id="foneConvidado"
              name="foneConvidado"
              value={draftFilters.foneConvidado}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
              placeholder="Telefone do convidado"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="loja">
              Loja
            </label>
            <input
              id="loja"
              name="loja"
              value={draftFilters.loja}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
              placeholder="Buscar por loja"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="praca">
              Praça
            </label>
            <input
              id="praca"
              name="praca"
              value={draftFilters.praca}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
              placeholder="Buscar por praça"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="dataInicio">
              Data inicial
            </label>
            <input
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={draftFilters.dataInicio}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1" htmlFor="dataFim">
              Data final
            </label>
            <input
              id="dataFim"
              name="dataFim"
              type="date"
              value={draftFilters.dataFim}
              onChange={handleDraftChange}
              className="w-full px-3 py-2 rounded bg-[#232323] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF00FF]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 rounded border border-gray-700 bg-[#232323] hover:bg-[#2d2d2d] text-sm transition"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#BF00FF] hover:bg-[#D100FF] text-white text-sm font-semibold transition"
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-900/70 bg-red-950/40 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-4 py-3 border-b border-gray-800">
          <div className="text-sm text-gray-300">
            {filters.nome || filters.praca || filters.loja || filters.dataInicio || filters.dataFim
              ? buildFilterSummary(filters)
              : 'Nenhum filtro aplicado'}
          </div>
          <div className="text-sm text-gray-400">
            {tableLoading ? 'Atualizando...' : `${totalItems} registro(s)`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#202020] text-gray-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('id')}>
                    {formatSortLabel(sortField, sortOrder, 'id', 'ID')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('nome')}>
                    {formatSortLabel(sortField, sortOrder, 'nome', 'Nome')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('fone')}>
                    {formatSortLabel(sortField, sortOrder, 'fone', 'Telefone')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('nomeConvidado')}>
                    {formatSortLabel(sortField, sortOrder, 'nomeConvidado', 'Nome do convidado')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('foneConvidado')}>
                    {formatSortLabel(sortField, sortOrder, 'foneConvidado', 'Telefone do convidado')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('loja')}>
                    {formatSortLabel(sortField, sortOrder, 'loja', 'Loja')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('praca')}>
                    {formatSortLabel(sortField, sortOrder, 'praca', 'Praça')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" className="font-semibold" onClick={() => handleSort('dataCadastro')}>
                    {formatSortLabel(sortField, sortOrder, 'dataCadastro', 'Data cadastro')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    Nenhum cadastro encontrado para os filtros informados.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-[#1f1f1f] transition-colors">
                    <td className="px-4 py-3 text-gray-400">{row.id}</td>
                    <td className="px-4 py-3 text-white font-medium">{row.nome}</td>
                    <td className="px-4 py-3 text-gray-200">{row.fone}</td>
                    <td className="px-4 py-3 text-gray-200">{row.nomeConvidado}</td>
                    <td className="px-4 py-3 text-gray-200">{row.foneConvidado}</td>
                    <td className="px-4 py-3 text-gray-200">{row.loja}</td>
                    <td className="px-4 py-3 text-gray-200">{row.praca}</td>
                    <td className="px-4 py-3 text-gray-200 whitespace-nowrap">{formatDateTime(row.dataCadastro)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4 border-t border-gray-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span>Linhas por página</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-[#232323] border border-gray-700 rounded px-3 py-2 text-white"
            >
              {PAGE_SIZE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-gray-400">
              {from}-{to} de {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <button
              type="button"
              onClick={() => handlePageChange(0)}
              disabled={page === 0 || tableLoading}
              className="px-3 py-2 rounded bg-[#232323] border border-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {'<<'}
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || tableLoading}
              className="px-3 py-2 rounded bg-[#232323] border border-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm text-gray-300">
              Página {page + 1} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page + 1 >= totalPages || tableLoading}
              className="px-3 py-2 rounded bg-[#232323] border border-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page + 1 >= totalPages || tableLoading}
              className="px-3 py-2 rounded bg-[#232323] border border-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {'>>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
