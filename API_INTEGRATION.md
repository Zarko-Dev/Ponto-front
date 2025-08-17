# Integração com API REST

Este projeto está configurado para se comunicar com uma API REST backend usando axios. Aqui está um guia completo de como usar os serviços e hooks.

## 📁 Estrutura dos Serviços

### 1. **api.ts** - Configuração Base
Configuração centralizada do axios com interceptors para:
- Adicionar token de autenticação automaticamente
- Tratar erros de autenticação (401)
- Configurar timeout e headers padrão

### 2. **authService.ts** - Autenticação
Gerencia todas as operações de autenticação:
- Login
- Registro
- Registro de admin
- Logout
- Verificação de usuário atual
- Verificação de token

### 3. **sessionService.ts** - Sessões de Trabalho
Gerencia o ponto eletrônico:
- Iniciar/finalizar sessões
- Gerenciar pausas
- Obter estatísticas
- Consultar sessões

### 4. **userService.ts** - Usuários
Gerencia operações de usuários:
- CRUD de usuários (apenas admin)
- Alteração de senha
- Estatísticas de usuário

## 🎣 Hooks Personalizados

### **useApi**
Hook genérico para qualquer chamada de API:

```typescript
import { useApi } from '../hooks/useApi';
import authService from '../services/authService';

function LoginComponent() {
  const { execute: login, loading, error, data } = useApi(authService.login);

  const handleLogin = async () => {
    const result = await login({ email: 'user@example.com', password: '123456' });
    if (result) {
      console.log('Login realizado:', result);
    }
  };

  return (
    <View>
      {loading && <Text>Carregando...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}
```

### **useCrudApi**
Hook específico para operações CRUD:

```typescript
import { useCrudApi } from '../hooks/useApi';
import userService from '../services/userService';

function UsersList() {
  const { 
    data: users, 
    loading, 
    error, 
    fetchData, 
    createData, 
    updateData, 
    deleteData 
  } = useCrudApi(userService);

  useEffect(() => {
    fetchData(); // Carregar lista de usuários
  }, []);

  const handleCreateUser = async () => {
    const newUser = await createData({
      name: 'João Silva',
      email: 'joao@example.com',
      password: '123456'
    });
  };

  return (
    <View>
      {loading && <Text>Carregando usuários...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {users?.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </View>
  );
}
```

## 🚀 Como Usar

### 1. **Configuração Inicial**
Certifique-se de que o backend está rodando na porta configurada (padrão: 3000).

### 2. **Autenticação**
```typescript
import authService from '../services/authService';

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: '123456'
});

// Verificar se está autenticado
if (authService.isAuthenticated()) {
  console.log('Usuário logado');
}

// Obter usuário atual
const user = await authService.getCurrentUser();
```

### 3. **Gerenciar Ponto Eletrônico**
```typescript
import sessionService from '../services/sessionService';

// Iniciar trabalho
const session = await sessionService.startSession();

// Iniciar pausa
await sessionService.startPause(session.id);

// Finalizar pausa
await sessionService.endPause(session.id);

// Finalizar trabalho
await sessionService.endSession(session.id);

// Obter sessão atual
const currentSession = await sessionService.getCurrentSession();
```

### 4. **Gerenciar Usuários (Admin)**
```typescript
import userService from '../services/userService';

// Listar usuários
const users = await userService.getUsers();

// Criar usuário
const newUser = await userService.createUser({
  name: 'Maria Silva',
  email: 'maria@example.com',
  password: '123456',
  role: 'USER'
});

// Atualizar usuário
await userService.updateUser(userId, {
  name: 'Maria Santos'
});
```

## ⚙️ Configuração de Ambiente

### **Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### **Configurações por Ambiente**
As configurações são automaticamente carregadas baseadas no ambiente:

- **Development**: `http://localhost:3000`
- **Production**: `https://sua-api-producao.com`
- **Test**: `http://localhost:3001`

## 🔒 Segurança

### **Token de Autenticação**
- O token JWT é automaticamente incluído em todas as requisições
- Tokens expirados são automaticamente removidos
- Redirecionamento para login em caso de erro 401

### **Validação de Permissões**
- Verificação automática de roles (USER/ADMIN)
- Middleware de autorização no backend
- Controle de acesso baseado em permissões

## 📱 Exemplos de Componentes

### **LoginForm.tsx**
Componente de exemplo para login usando `useApi`.

### **PontoEletronico.tsx**
Componente completo para gerenciar o ponto eletrônico.

## 🐛 Tratamento de Erros

### **Erros de API**
- Erros são automaticamente capturados e exibidos
- Estados de loading são gerenciados automaticamente
- Mensagens de erro são extraídas da resposta da API

### **Erros de Rede**
- Timeout configurado para 10 segundos
- Retry automático para erros temporários
- Fallback para estado offline

## 🔄 Atualizações em Tempo Real

Para implementar atualizações em tempo real, considere:
- WebSockets para notificações
- Polling automático para dados críticos
- Cache local com invalidação automática

## 📚 Recursos Adicionais

- **TypeScript**: Todas as interfaces estão tipadas
- **Error Boundaries**: Para capturar erros de renderização
- **Loading States**: Estados de carregamento para melhor UX
- **Offline Support**: Cache local para funcionamento offline

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **CORS Error**: Verifique se o backend está configurado para aceitar requisições do frontend
2. **Token Inválido**: Limpe o token e faça login novamente
3. **Timeout**: Aumente o valor de timeout se necessário
4. **URL Incorreta**: Verifique a configuração de ambiente

### **Debug**
```typescript
// Habilitar logs detalhados
console.log('API URL:', getConfig().API_URL);
console.log('Token:', authService.getToken());
console.log('User:', await authService.getCurrentUser());
```

---

Para mais informações, consulte a documentação da API backend ou entre em contato com a equipe de desenvolvimento.
