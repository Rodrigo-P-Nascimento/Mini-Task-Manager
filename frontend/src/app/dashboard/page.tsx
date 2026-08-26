'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { taskApi } from '@/services/api';
import { Table, Button, Tag, Select, Alert, Card, Space, Typography, Popconfirm, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [responsavelFilter, setResponsavelFilter] = useState('');

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
      if (responsavelFilter) params.responsavel = responsavelFilter;

      const response = await taskApi.get('/tasks', { params });
      setTasks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError('Erro ao carregar tarefas. Verifique se o task-service está ativo.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, responsavelFilter]);

  useEffect(() => {
    if (token) {
      carregarTarefas();
    }
  }, [carregarTarefas, token]);

  const handleDelete = async (id: number) => {
    try {
      await taskApi.delete(`/tasks/${id}`);
      carregarTarefas();
    } catch (err) {
      alert('Erro ao excluir tarefa.');
    }
  };

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text: string, record: Task) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.descricao && (
            <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
              {record.descricao}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timeNome',
      key: 'timeNome',
      render: (text: string) => text || 'Sem time',
    },
    {
      title: 'Prioridade',
      dataIndex: 'prioridade',
      key: 'prioridade',
      render: (prioridade: string) => {
        let color = 'green';
        if (prioridade === 'ALTA') color = 'red';
        if (prioridade === 'MEDIA') color = 'orange';
        return <Tag color={color}>{prioridade}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'CONCLUIDA') color = 'success';
        if (status === 'EM_ANDAMENTO') color = 'processing';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Prazo',
      dataIndex: 'dataTermino',
      key: 'dataTermino',
      render: (text: string | null) => text ? text : 'Sem prazo',
    },
    {
      title: 'Ações',
      key: 'acoes',
      align: 'right' as const,
      render: (_: any, record: Task) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/tasks/${record.id}/edit`)}
            style={{ color: '#2563eb' }}
          >
            Editar
          </Button>
          <Popconfirm
            title="Deseja excluir esta tarefa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f172a' }}>Mini Task Manager</Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>Gestão de tarefas em equipe</Text>
        </div>
        <div className="flex items-center gap-4">
          <Text>
            Olá, <strong style={{ color: '#2563eb' }}>{user?.nome || 'Usuário'}</strong>
          </Text>
          <Button
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Card bodyStyle={{ padding: '16px' }} className="mb-6 shadow-sm border-slate-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <Space wrap>
              <Select
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(0);
                }}
                style={{ width: 180 }}
              >
                <Option value="">Todos os Status</Option>
                <Option value="PENDENTE">Pendente</Option>
                <Option value="EM_ANDAMENTO">Em Andamento</Option>
                <Option value="CONCLUIDA">Concluída</Option>
              </Select>

              <Select
                value={priorityFilter}
                onChange={(val) => {
                  setPriorityFilter(val);
                  setPage(0);
                }}
                style={{ width: 180 }}
              >
                <Option value="">Todas as Prioridades</Option>
                <Option value="BAIXA">Baixa</Option>
                <Option value="MEDIA">Média</Option>
                <Option value="ALTA">Alta</Option>
              </Select>

              <Space.Compact>
                <Input
                  placeholder="ID do Resp."
                  value={responsavelFilter}
                  onChange={(e) => {
                    setResponsavelFilter(e.target.value);
                    setPage(0);
                  }}
                  style={{ width: 110 }}
                  type="number"
                  allowClear
                />
                {user?.id && (
                  <Button onClick={() => {
                    setResponsavelFilter(String(user.id));
                    setPage(0);
                  }}>
                    Minhas
                  </Button>
                )}
              </Space.Compact>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/tasks/new')}
              style={{ backgroundColor: '#2563eb' }}
            >
              Nova Tarefa
            </Button>
          </div>
        </Card>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        <Card bodyStyle={{ padding: 0 }} className="shadow-sm border-slate-200 overflow-hidden">
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page + 1,
              pageSize: 5,
              total: totalPages * 5,
              onChange: (newPage) => setPage(newPage - 1),
              showSizeChanger: false,
            }}
          />
        </Card>
      </main>
    </div>
  );
}