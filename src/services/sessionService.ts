import api from './api';

export interface WorkSession {
  id: number;
  userId: number;
  startTime: string;
  endTime?: string;
  totalHours?: number;
  createdAt: string;
  timeRecords: TimeRecord[];
}

export interface TimeRecord {
  id: number;
  sessionId: number;
  recordType: 'ENTRADA' | 'SAIDA' | 'PAUSA_INICIO' | 'PAUSA_FIM';
  timestamp: string;
}

export interface SessionStats {
  totalSessions: number;
  totalHours: number;
  averageSessionDuration: number;
}

class SessionService {
  // Obter sessões do usuário logado
  async getMySessions(): Promise<WorkSession[]> {
    try {
      console.log('📡 SessionService: Buscando sessões do usuário...');
      const response = await api.get('/sessions/my');
      console.log('📥 SessionService: Sessões recebidas:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ SessionService: Erro ao buscar sessões:', error);
      throw error;
    }
  }

  // Iniciar uma nova sessão de trabalho
  async startSession(): Promise<WorkSession> {
    try {
      console.log('📡 SessionService: Iniciando nova sessão...');
      const response = await api.post('/sessions/start');
      console.log('✅ SessionService: Sessão iniciada:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ SessionService: Erro ao iniciar sessão:', error);
      throw error;
    }
  }

  // Iniciar pausa em uma sessão
  async startPause(sessionId: number): Promise<TimeRecord> {
    try {
      console.log('📡 SessionService: Iniciando pausa na sessão:', sessionId);
      const response = await api.post(`/sessions/${sessionId}/pause/start`);
      console.log('✅ SessionService: Pausa iniciada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ SessionService: Erro ao iniciar pausa:', error);
      throw error;
    }
  }

  // Finalizar pausa em uma sessão
  async endPause(sessionId: number): Promise<TimeRecord> {
    try {
      console.log('📡 SessionService: Finalizando pausa na sessão:', sessionId);
      const response = await api.post(`/sessions/${sessionId}/pause/end`);
      console.log('✅ SessionService: Pausa finalizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ SessionService: Erro ao finalizar pausa:', error);
      throw error;
    }
  }

  // Finalizar uma sessão de trabalho
  async endSession(sessionId: number): Promise<WorkSession> {
    try {
      console.log('📡 SessionService: Finalizando sessão:', sessionId);
      const response = await api.post(`/sessions/${sessionId}/end`);
      console.log('✅ SessionService: Sessão finalizada:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ SessionService: Erro ao finalizar sessão:', error);
      throw error;
    }
  }

  // Obter sessão atual (em aberto) do usuário
  async getCurrentSession(): Promise<WorkSession | null> {
    try {
      console.log('📡 SessionService: Buscando sessão atual...');
      const response = await api.get('/sessions/current');
      
      if (response.data.hasOpenSession) {
        console.log('✅ SessionService: Sessão atual encontrada:', response.data.session.id);
        return response.data.session;
      } else {
        console.log('ℹ️ SessionService: Nenhuma sessão ativa encontrada');
        return null;
      }
    } catch (error) {
      console.error('❌ SessionService: Erro ao buscar sessão atual:', error);
      return null;
    }
  }

  // Calcular estatísticas das sessões
  async getSessionStats(): Promise<SessionStats> {
    try {
      console.log('📡 SessionService: Buscando estatísticas...');
      const response = await api.get('/sessions/stats');
      console.log('✅ SessionService: Estatísticas recebidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ SessionService: Erro ao buscar estatísticas:', error);
      // Retornar valores padrão em caso de erro
      return {
        totalSessions: 0,
        totalHours: 0,
        averageSessionDuration: 0
      };
    }
  }
}

export default new SessionService();
