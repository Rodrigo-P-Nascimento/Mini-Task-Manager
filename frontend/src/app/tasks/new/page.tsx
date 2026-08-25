'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface Team {
  id: number;
  nome: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('PENDENTE');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [responsavel, setResponsavel] = useState<string>('');
  const [timeId, setTimeId] = useState<string>('');
  const [dataTermino, setDataTermino] = useState('');

  const [times, setTimes] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function carregarTimes() {
      try {
        const response = await taskApi.get('/teams');
        setTimes(response.data);
        if (response.data.length > 0) {
          setTimeId(String(response.data[0].id));
        }
      } catch (err) {
        setError('Não foi possível carregar a lista de times.');
      }
    }

    if (token) {
      carregarTimes();
    }
  }, [token]);

  const handleCriarTimeRapido = async () => {
    const nomeTime = prompt('Digite o nome do novo time:');
    if (!nomeTime) return;

    try {
      const response = await taskApi.post('/teams', {
        nome: nomeTime,
        membros: user?.id ? [user.id] : [],
      });
      setTimes((prev) => [...prev, response.data]);
      setTimeId(String(response.data.id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar time.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (status === 'CONCLUIDA' && !responsavel) {
      setError('Uma tarefa só pode ser marcada como Concluída se houver um responsável.');
      return;
    }

    if (!timeId) {
      setError('Selecione ou crie um time para vincular à tarefa.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        titulo,
        descricao,
        status,
        prioridade,
        responsavel: responsavel ? Number(responsavel) : null,
        timeId: Number(timeId),
        dataTermino: dataTermino || null,
      };

      await taskApi.post('/tasks', payload);
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erro ao cadastrar tarefa.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">Nova Tarefa</h1>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Voltar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Criar migration no banco"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre a entrega..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prioridade *
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-700">Time *</label>
                <button
                  type="button"
                  onClick={handleCriarTimeRapido}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  + Criar Time
                </button>
              </div>
              <select
                value={timeId}
                onChange={(e) => setTimeId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {times.length === 0 && (
                  <option value="">Nenhum time disponível</option>
                )}
                {times.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ID do Responsável
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="ID numérico"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {user?.id && (
                  <button
                    type="button"
                    onClick={() => setResponsavel(String(user.id))}
                    className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg whitespace-nowrap font-medium text-slate-700"
                  >
                    Eu ({user.id})
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Término (Prazo)
            </label>
            <input
              type="date"
              value={dataTermino}
              onChange={(e) => setDataTermino(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}