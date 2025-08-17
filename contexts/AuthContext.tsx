import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import authService, { LoginData } from '../src/services/authService';

export interface User {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  jornada: string;
  senha: string;
  isAdmin: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  removeUser: (userId: string) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    // Usuários padrão para teste
    {
      id: '1',
      nome: 'Admin Sistema',
      cpf: '000.000.000-00',
      email: 'admin@pontoapp.com',
      jornada: '8h/dia',
      senha: 'admin123',
      isAdmin: true,
    },
    {
      id: '2',
      nome: 'João Silva',
      cpf: '123.456.789-01',
      email: 'joao@empresa.com',
      jornada: '8h/dia',
      senha: '123456',
      isAdmin: false,
    },
    {
      id: '3',
      nome: 'Maria Santos',
      cpf: '987.654.321-09',
      email: 'maria@empresa.com',
      jornada: '6h/dia',
      senha: '123456',
      isAdmin: false,
    },
  ]);

  // Carregar token salvo na inicialização
  useEffect(() => {
    const loadSavedToken = async () => {
      console.log('🔄 AuthContext: Carregando token salvo...');
      await authService.loadToken();
      console.log('🔑 AuthContext: Token carregado:', global.token ? 'SIM' : 'NÃO');
      
      // Se tem token, tentar carregar dados do usuário
      if (global.token) {
        try {
          console.log('👤 AuthContext: Carregando dados do usuário...');
          const userData = await authService.getCurrentUser();
          
          const apiUser = {
            id: userData.id,
            nome: userData.name,
            cpf: '000.000.000-00',
            email: userData.email,
            jornada: '8h/dia',
            senha: '',
            isAdmin: userData.role === 'ADMIN',
          };
          
          setCurrentUser(apiUser);
          console.log('✅ AuthContext: Usuário restaurado:', apiUser.nome);
        } catch (error) {
          console.error('❌ AuthContext: Erro ao carregar dados do usuário, limpando token...');
          await authService.removeToken();
          setCurrentUser(null);
        }
      }
    };
    
    loadSavedToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext: Iniciando login...', { email });
      
      const loginData: LoginData = { email, password };
      console.log('📤 AuthContext: Enviando dados para API...', loginData);
      
      const response = await authService.login(loginData);
      console.log('📥 AuthContext: Resposta da API recebida:', response);
      
      // Converter dados da API para o formato do User local
      const apiUser = {
        id: response.user.id,
        nome: response.user.name,
        cpf: '000.000.000-00', // Valor padrão por enquanto
        email: response.user.email,
        jornada: '8h/dia', // Valor padrão por enquanto
        senha: '', // Não armazenar senha
        isAdmin: response.user.role === 'ADMIN',
      };
      
      console.log('👤 AuthContext: Usuário convertido:', apiUser);
      setCurrentUser(apiUser);
      
      console.log('✅ AuthContext: Login realizado com sucesso!');
      return true;
      
    } catch (error) {
      console.error('❌ AuthContext: Erro no login:', error);
      
      // Se a API falhar, tentar com dados locais como fallback
      console.log('🔄 AuthContext: Tentando fallback com dados locais...');
      const user = users.find(u => u.email === email && u.senha === password);
      
      if (user) {
        console.log('✅ AuthContext: Login local bem-sucedido!');
        setCurrentUser(user);
        return true;
      }
      
      console.log('❌ AuthContext: Login falhou completamente');
      return false;
    }
  };

  const logout = async () => {
    console.log('🚪 AuthContext: Iniciando processo de logout...');
    
    try {
      // Limpar token da API
      console.log('🌐 AuthContext: Fazendo logout na API...');
      await authService.logout();
      console.log('✅ AuthContext: Logout na API concluído');
    } catch (error) {
      console.error('⚠️ AuthContext: Erro ao fazer logout na API, continuando...', error);
    }
    
    // Forçar limpeza completa do estado local
    console.log('🧹 AuthContext: Limpando estado local...');
    setCurrentUser(null);
    
    // Limpar token global de forma forçada
    console.log('🔑 AuthContext: Limpando token global...');
    global.token = null;
    
    // Forçar remoção do token do storage
    try {
      await authService.removeToken();
      console.log('✅ AuthContext: Token removido do storage');
    } catch (error) {
      console.error('❌ AuthContext: Erro ao remover token do storage:', error);
    }
    
    console.log('✅ AuthContext: Logout realizado com sucesso');
    console.log('🔍 AuthContext: Estado atual - Usuário:', currentUser, 'Token:', global.token);
    
    // Forçar uma nova verificação de estado após um pequeno delay
    setTimeout(() => {
      console.log('🔄 AuthContext: Forçando re-verificação de autenticação...');
      // Garantir que o estado foi realmente limpo
      if (currentUser !== null) {
        console.log('⚠️ AuthContext: Estado ainda não foi limpo, forçando...');
        setCurrentUser(null);
      }
    }, 100);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...userData } : user
    ));
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const value: AuthContextType = {
    currentUser,
    users: users.filter(u => !u.isAdmin), // Não mostrar admins na lista
    login,
    logout,
    addUser,
    updateUser,
    removeUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
