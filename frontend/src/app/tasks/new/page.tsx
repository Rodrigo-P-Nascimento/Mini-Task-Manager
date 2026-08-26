'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, Input, Select, Button, Alert, Typography, Form, Space } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

  const handleSubmit = async () => {
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
      <Card className="w-full max-w-2xl shadow-sm border-slate-200 rounded-xl" bodyStyle={{ padding: '2rem' }}>
        <div className="flex justify-between items-center mb-6">
          <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Nova Tarefa</Title>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/dashboard')}
          >
            Voltar
          </Button>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Título" required>
            <Input
              size="large"
              placeholder="Ex: Criar migration no banco"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </Form.Item>

          <Form.Item label="Descrição">
            <TextArea
              rows={3}
              placeholder="Detalhes sobre a entrega..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Status" required>
              <Select size="large" value={status} onChange={setStatus}>
                <Option value="PENDENTE">Pendente</Option>
                <Option value="EM_ANDAMENTO">Em Andamento</Option>
                <Option value="CONCLUIDA">Concluída</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Prioridade" required>
              <Select size="large" value={prioridade} onChange={setPrioridade}>
                <Option value="BAIXA">Baixa</Option>
                <Option value="MEDIA">Média</Option>
                <Option value="ALTA">Alta</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>Time *</span>
                  <Button type="link" size="small" onClick={handleCriarTimeRapido} style={{ padding: 0 }}>
                    + Criar Time
                  </Button>
                </div>
              }
            >
              <Select size="large" value={timeId} onChange={setTimeId} placeholder="Selecione um time">
                {times.length === 0 && (
                  <Option value="" disabled>Nenhum time disponível</Option>
                )}
                {times.map((t) => (
                  <Option key={t.id} value={String(t.id)}>
                    {t.nome}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="ID do Responsável">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  size="large"
                  type="number"
                  placeholder="ID numérico"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                />
                {user?.id && (
                  <Button size="large" onClick={() => setResponsavel(String(user.id))}>
                    Eu ({user.id})
                  </Button>
                )}
              </Space.Compact>
            </Form.Item>
          </div>

          <Form.Item label="Data de Término (Prazo)">
            <Input
              size="large"
              type="date"
              value={dataTermino}
              onChange={(e) => setDataTermino(e.target.value)}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button size="large" onClick={() => router.push('/dashboard')}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ backgroundColor: '#2563eb' }}
            >
              Criar Tarefa
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}