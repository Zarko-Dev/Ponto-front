import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  logout: () => void;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = users.find(u => u.email === email && u.senha === password);
    
    if (user) {
      setCurrentUser(user);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
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
