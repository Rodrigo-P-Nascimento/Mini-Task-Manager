'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { taskApi } from '@/services/api';

interface Task {
  id: number;
  titulo: string;
  descricao: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  responsavel: number | null;
  timeId: number;
  timeNome: string;
  dataCriacao: string;
  dataTermino: string | null;
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const savedToken = document.cookie.includes('token=');
      if (!savedToken) {
        router.push('/login');
      }
    }
  }, [token, router]);

  const carregarTarefas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page: page,
        size: 5,
      };

      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.prioridade = priorityFilter;

      const response = await taskApi.get('/tasks', { params });
      setTasks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError('Erro ao carregar tarefas. Verifique se o task-service está ativo.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => {
    if (token) {
      carregarTarefas();
    }
  }, [carregarTarefas, token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta tarefa?')) return;

    try {
      await taskApi.delete(`/tasks/${id}`);
      carregarTarefas();
    } catch (err) {
      alert('Erro ao excluir tarefa.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mini Task Manager</h1>
          <p className="text-xs text-slate-500">Gestão de tarefas em equipe</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">
            Olá, <strong className="text-blue-600">{user?.nome || 'Usuário'}</strong>
          </span>
          <button
            onClick={logout}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 transition"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as Prioridades</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>

          <button
            onClick={() => router.push('/tasks/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
          >
            + Nova Tarefa
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando tarefas...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhuma tarefa encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-4">Título</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Prioridade</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Prazo</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-800">
                        {task.titulo}
                        {task.descricao && (
                          <p className="text-xs text-slate-500 font-normal line-clamp-1">
                            {task.descricao}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">{task.timeNome || 'Sem time'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            task.prioridade === 'ALTA'
                              ? 'bg-red-100 text-red-700'
                              : task.prioridade === 'MEDIA'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {task.prioridade}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            task.status === 'CONCLUIDA'
                              ? 'bg-emerald-100 text-emerald-700'
                              : task.status === 'EM_ANDAMENTO'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        {task.dataTermino ? task.dataTermino : 'Sem prazo'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/tasks/${task.id}/edit`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600 bg-slate-50">
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 transition"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}