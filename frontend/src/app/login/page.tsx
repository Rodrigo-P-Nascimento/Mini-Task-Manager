'use client';

import { useState } from 'react';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Card, Input, Button, Alert, Typography, Form } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authApi.post('/register', { nome, email, senha });
        login(response.data.token, {
          id: response.data.userId,
          nome: response.data.nome,
          email: response.data.email,
        });
      } else {
        const response = await authApi.post('/login', { email, senha });
        login(response.data.token, {
          id: response.data.userId,
          nome: response.data.nome,
          email: response.data.email,
        });
      }
    } catch (err: any) {
      const mensagemErro =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Falha na autenticação. Verifique suas credenciais.';
      setError(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-md border-0 rounded-xl" bodyStyle={{ padding: '2rem' }}>
        <div className="text-center mb-6">
          <Title level={3} style={{ margin: 0, color: '#1e293b' }}>Mini Task Manager</Title>
          <Text type="secondary">
            {isRegister ? 'Crie sua conta para começar' : 'Entre com suas credenciais'}
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          {isRegister && (
            <Form.Item label="Nome Completo" required>
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Form.Item>
          )}

          <Form.Item label="E-mail" required>
            <Input
              size="large"
              type="email"
              prefix={<MailOutlined />}
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Senha" required>
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </Form.Item>

          <Form.Item className="mb-2 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ backgroundColor: '#2563eb' }}
            >
              {isRegister ? 'Cadastrar' : 'Entrar'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text type="secondary">
            {isRegister ? 'Já tem uma conta?' : 'Ainda não possui uma conta?'}
          </Text>{' '}
          <Link
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Fazer Login' : 'Cadastre-se'}
          </Link>
        </div>
      </Card>
    </main>
  );
}