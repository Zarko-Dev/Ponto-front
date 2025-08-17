import api from './api';
// Storage adaptado para web e mobile
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    // Fallback para mobile
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    // Fallback para mobile
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    // Fallback para mobile
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
};

const TOKEN_KEY = '@PontoApp:token';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

class AuthService {
  // Carregar token do storage na inicialização
  async loadToken(): Promise<void> {
    try {
      console.log('🔄 AuthService: Carregando token do storage...');
      const token = await storage.getItem(TOKEN_KEY);
      if (token) {
        global.token = token;
        console.log('✅ AuthService: Token carregado com sucesso');
      } else {
        console.log('ℹ️ AuthService: Nenhum token encontrado no storage');
      }
    } catch (error) {
      console.error('❌ AuthService: Erro ao carregar token:', error);
    }
  }

  // Salvar token no storage
  async saveToken(token: string): Promise<void> {
    try {
      console.log('💾 AuthService: Salvando token...');
      await storage.setItem(TOKEN_KEY, token);
      global.token = token;
      console.log('✅ AuthService: Token salvo com sucesso');
    } catch (error) {
      console.error('❌ AuthService: Erro ao salvar token:', error);
    }
  }

  // Remover token do storage
  async removeToken(): Promise<void> {
    try {
      console.log('🗑️ AuthService: Removendo token...');
      await storage.removeItem(TOKEN_KEY);
      global.token = null;
      console.log('✅ AuthService: Token removido com sucesso');
    } catch (error) {
      console.error('❌ AuthService: Erro ao remover token:', error);
      global.token = null;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const result = response.data;
    
    // Armazenar token
    await this.saveToken(result.token);
    
    return result;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const result = response.data;
    
    // Armazenar token
    await this.saveToken(result.token);
    
    return result;
  }

  async registerAdmin(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register-admin', data);
    const result = response.data;
    
    // Armazenar token
    await this.saveToken(result.token);
    
    return result;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Sempre limpar o token local, mesmo se a requisição falhar
      await this.removeToken();
    }
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await api.get('/users/me');
    return response.data;
  }

  async isAuthenticated(): Promise<boolean> {
    if (!global.token) {
      await this.loadToken();
    }
    return !!global.token;
  }

  async getToken(): Promise<string | null> {
    if (!global.token) {
      await this.loadToken();
    }
    return global.token;
  }
}

export default new AuthService();
