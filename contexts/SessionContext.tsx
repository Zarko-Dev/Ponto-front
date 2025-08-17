import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import sessionService, { WorkSession, TimeRecord } from '../src/services/sessionService';

interface SessionContextType {
  currentSession: WorkSession | null;
  sessions: WorkSession[];
  loading: boolean;
  startSession: () => Promise<boolean>;
  endSession: () => Promise<boolean>;
  refreshSessions: (force?: boolean) => Promise<void>;
  getTodayRecords: () => TimeRecord[];
  clearCurrentSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de um SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Carregar sessões do usuário
  const refreshSessions = async (force: boolean = false) => {
    // Cache de 30 segundos para evitar chamadas excessivas
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 segundos
    
    if (!force && (now - lastRefresh) < CACHE_DURATION) {
      console.log('⏰ SessionContext: Cache ainda válido, pulando atualização');
      return;
    }
    
    try {
      console.log('📊 SessionContext: Carregando sessões...');
      setLoading(true);
      setLastRefresh(now);
      
      // Buscar sessões e sessão atual em paralelo
      const [userSessions, current] = await Promise.all([
        sessionService.getMySessions(),
        sessionService.getCurrentSession()
      ]);
      
      console.log('📥 SessionContext: Sessões carregadas:', userSessions.length);
      console.log('🎯 SessionContext: Sessão atual:', current ? `ID ${current.id}` : 'Nenhuma');
      
      setSessions(userSessions);
      setCurrentSession(current);
      
    } catch (error) {
      console.error('❌ SessionContext: Erro ao carregar sessões:', error);
      // Em caso de erro, limpar estado para evitar inconsistências
      setSessions([]);
      setCurrentSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar nova sessão (Entrada)
  const startSession = async (): Promise<boolean> => {
    try {
      console.log('🚀 SessionContext: Iniciando nova sessão...');
      setLoading(true);
      
      // Verificar se já existe sessão ativa
      if (currentSession) {
        console.log('⚠️ SessionContext: Já existe sessão ativa');
        return false;
      }
      
      const newSession = await sessionService.startSession();
      console.log('✅ SessionContext: Sessão iniciada:', newSession);
      
      // Forçar atualização imediata
      await refreshSessions(true);
      
      return true;
    } catch (error: any) {
      console.error('❌ SessionContext: Erro ao iniciar sessão:', error);
      
      // Se o erro é "Sessão já iniciada", recarregar sessões para sincronizar o estado
      if (error.response?.status === 400 && error.response?.data?.code === 'SESSION_ALREADY_OPEN') {
        console.log('🔄 SessionContext: Sessão já existe no servidor, sincronizando...');
        await refreshSessions(true);
        return false;
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar sessão atual (Saída)
  const endSession = async (): Promise<boolean> => {
    try {
      console.log('🏁 SessionContext: Finalizando sessão...');
      setLoading(true);
      
      if (!currentSession) {
        console.log('⚠️ SessionContext: Nenhuma sessão ativa para finalizar');
        return false;
      }
      
      const endedSession = await sessionService.endSession(currentSession.id);
      console.log('✅ SessionContext: Sessão finalizada:', endedSession);
      
      // Limpar sessão atual imediatamente
      setCurrentSession(null);
      
      // Forçar atualização imediata
      await refreshSessions(true);
      
      return true;
    } catch (error) {
      console.error('❌ SessionContext: Erro ao finalizar sessão:', error);
      // Mesmo com erro, tentar atualizar para sincronizar
      await refreshSessions(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Limpar sessão atual (útil para logout)
  const clearCurrentSession = () => {
    console.log('🧹 SessionContext: Limpando sessão atual');
    setCurrentSession(null);
  };

  // Obter registros de hoje
  const getTodayRecords = (): TimeRecord[] => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const todayRecords: TimeRecord[] = [];
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.startTime).toDateString();
      if (sessionDate === todayStr) {
        todayRecords.push(...session.timeRecords);
      }
    });
    
    // Ordenar por timestamp
    return todayRecords.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Carregar sessões na inicialização
  useEffect(() => {
    refreshSessions();
  }, []);

  const value: SessionContextType = {
    currentSession,
    sessions,
    loading,
    startSession,
    endSession,
    refreshSessions,
    getTodayRecords,
    clearCurrentSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
