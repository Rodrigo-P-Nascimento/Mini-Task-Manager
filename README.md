# Mini Task Manager

O **Mini Task Manager** é um sistema completo de gestão de tarefas em equipe, desenvolvido como parte de um desafio técnico para Desenvolvedor(a) Full Stack. 

A arquitetura foi dividida em microsserviços e utiliza tecnologias modernas tanto no back-end (Spring Boot 3) quanto no front-end (Next.js + Ant Design).

## 🚀 Como rodar o projeto localmente

A maneira mais fácil e recomendada de executar o projeto é utilizando o Docker Compose, que já está configurado para subir o banco de dados (MySQL) e ambas as APIs Spring Boot.

### 1. Pré-requisitos
- **Docker** e **Docker Compose** instalados.
- **Node.js** (versão 18+) para rodar o frontend.

### 2. Subindo os Microsserviços e o Banco de Dados
Na raiz do projeto, execute:
```bash
docker compose build
docker compose up -d
```

Este comando irá iniciar:
- Banco MySQL do Auth Service (porta 3306)
- Banco MySQL do Task Service (porta 3307)
- API Auth Service (porta 8081)
- API Task Service (porta 8082)

### 3. Rodando o Front-end
O front-end não foi incluído no docker-compose intencionalmente (para facilitar o hot-reload durante o desenvolvimento). Para rodá-lo:
```bash
cd frontend
npm install
npm run dev
```
Acesse o sistema no navegador através de: `http://localhost:3000`

---

## 🏗 Decisões de Arquitetura e Trade-offs

### 1. Arquitetura Orientada a Microsserviços (SOA)
Optei por separar a aplicação em dois microsserviços: `auth-service` e `task-service`.
- **Por quê?** Segregação de domínio. O serviço de autenticação cuida exclusivamente da gestão de usuários e emissão de JWT, podendo ser escalado independentemente ou utilizado por outras aplicações no futuro.
- **Trade-off:** Maior complexidade operacional e overhead de rede. O `task-service` precisa confiar e saber como validar o token gerado pelo `auth-service`. Para resolver isso, utilizei chaves simétricas compartilhadas de JWT.
- **O que deixei de fora:** Um API Gateway. Como são apenas 2 serviços, o front-end chama ambos diretamente (`:8081` e `:8082`). Num cenário de produção ideal, teríamos um Gateway (como Spring Cloud Gateway ou NGINX) roteando requisições.

### 2. Autenticação Stateless com JWT
O login gera um token assinado. O `task-service` extrai as informações do sujeito (email, id e nome) através dos *claims* validados do JWT e adiciona-os ao `SecurityContext` do Spring.
- **Vantagem:** Não há necessidade de chamadas síncronas entre `task-service` e `auth-service` a cada request de validação.

### 3. Frontend com Next.js e Ant Design (antd)
Para o front-end, decidi usar o ecossistema do React com **Next.js** (App Router) e **Ant Design** (antd) como biblioteca de componentes.
- **Por quê?** O Ant Design fornece componentes corporativos riquíssimos *out-of-the-box* (Tabelas com paginação embutida, Modais, alertas, pop-confirmations), o que acelerou absurdamente o desenvolvimento sem comprometer a beleza.

### 4. Testes Unitários
Foram implementados testes unitários utilizando JUnit e Mockito.
- Foco principal: A regra de negócio obrigatória: *"Uma tarefa não pode ser marcada como concluída se não possuir um responsável."*

---

## 🎯 O que foi feito e o que ficou de fora

**O que foi feito:**
✅ Autenticação com JWT, Login e Registro de contas.
✅ Microsserviços `auth-service` e `task-service`.
✅ CRUD Completo de tarefas, vinculado a um time e um responsável.
✅ Filtros na listagem por Status, Prioridade e ID do responsável (com botão para filtrar pelas "Minhas Tarefas").
✅ Testes Unitários da regra principal da Tarefa.
✅ Docker Compose estruturado e containerizado.

**O que ficou de fora (Diferenciais):**
❌ **Infraestrutura em Nuvem (AWS / Terraform) e CI/CD:** O foco foi garantir um código limpo, testes unitários e arquitetura bem estruturada dentro do prazo.
❌ **Mensageria (RabbitMQ / Kafka):** O escopo do desafio lida muito bem com comunicação síncrona ou simples divisão de JWT Claims, não sendo estritamente necessário implementar mensageria assíncrona.
❌ **Interface de gestão de "Times":** A entidade `Team` existe no backend e é mapeada no BD, mas assumi que a criação de times seria um fluxo administrativo fora do escopo principal das telas pedidas no desafio.