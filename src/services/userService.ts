import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
}

export interface UserStats {
  totalSessions: number;
  totalHours: number;
  averageSessionDuration: number;
  lastSession: string | null;
}

class UserService {
  // Obter usuário logado
  async getMe(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  }

  // Listar todos os usuários (apenas ADMIN)
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }

  // Obter usuário por ID (apenas ADMIN)
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Criar novo usuário (apenas ADMIN)
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  }

  // Atualizar usuário (apenas ADMIN)
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }

  // Deletar usuário (apenas ADMIN)
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Alterar senha do usuário
  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    await api.put(`/users/${id}/password`, {
      currentPassword,
      newPassword,
    });
  }

  // Obter estatísticas do usuário
  async getUserStats(id: number): Promise<UserStats> {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  }

  // Verificar se o usuário atual é admin
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getMe();
      return user.role === 'ADMIN';
    } catch (error) {
      return false;
    }
  }
}

export default new UserService();
