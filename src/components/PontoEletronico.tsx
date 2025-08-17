import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useApi } from '../hooks/useApi';
import sessionService from '../services/sessionService';
import { WorkSession } from '../services/sessionService';

export default function PontoEletronico() {
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  
  const { execute: startSession, loading: startingSession } = useApi(sessionService.startSession);
  const { execute: endSession, loading: endingSession } = useApi(sessionService.endSession);
  const { execute: startPause, loading: startingPause } = useApi(sessionService.startPause);
  const { execute: endPause, loading: endingPause } = useApi(sessionService.endPause);
  const { execute: getCurrentSession, loading: loadingSession } = useApi(sessionService.getCurrentSession);

  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    const session = await getCurrentSession();
    setCurrentSession(session);
  };

  const handleStartSession = async () => {
    const session = await startSession();
    if (session) {
      setCurrentSession(session);
      Alert.alert('Sucesso', 'Sessão iniciada com sucesso!');
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    
    const session = await endSession(currentSession.id);
    if (session) {
      setCurrentSession(null);
      Alert.alert('Sucesso', 'Sessão finalizada com sucesso!');
    }
  };

  const handleStartPause = async () => {
    if (!currentSession) return;
    
    const record = await startPause(currentSession.id);
    if (record) {
      Alert.alert('Sucesso', 'Pausa iniciada!');
      loadCurrentSession(); // Recarregar para atualizar o estado
    }
  };

  const handleEndPause = async () => {
    if (!currentSession) return;
    
    const record = await endPause(currentSession.id);
    if (record) {
      Alert.alert('Sucesso', 'Pausa finalizada!');
      loadCurrentSession(); // Recarregar para atualizar o estado
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSessionStatus = () => {
    if (!currentSession) return 'Nenhuma sessão ativa';
    
    const hasActivePause = currentSession.timeRecords.some(
      record => record.recordType === 'PAUSA_INICIO' && 
      !currentSession.timeRecords.some(
        pauseEnd => pauseEnd.recordType === 'PAUSA_FIM' && 
        pauseEnd.timestamp > record.timestamp
      )
    );
    
    if (hasActivePause) return 'Em pausa';
    return 'Trabalhando';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ponto Eletrônico</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusValue}>{getSessionStatus()}</Text>
      </View>

      {currentSession && (
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>
            Sessão iniciada: {formatTime(currentSession.startTime)}
          </Text>
          <Text style={styles.sessionText}>
            ID da sessão: {currentSession.id}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!currentSession ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton, startingSession && styles.buttonDisabled]}
            onPress={handleStartSession}
            disabled={startingSession}
          >
            <Text style={styles.buttonText}>
              {startingSession ? 'Iniciando...' : 'Iniciar Trabalho'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.pauseButton, startingPause && styles.buttonDisabled]}
              onPress={handleStartPause}
              disabled={startingPause}
            >
              <Text style={styles.buttonText}>
                {startingPause ? 'Iniciando...' : 'Iniciar Pausa'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resumeButton, endingPause && styles.buttonDisabled]}
              onPress={handleEndPause}
              disabled={endingPause}
            >
              <Text style={styles.buttonText}>
                {endingPause ? 'Finalizando...' : 'Finalizar Pausa'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.endButton, endingSession && styles.buttonDisabled]}
              onPress={handleEndSession}
              disabled={endingSession}
            >
              <Text style={styles.buttonText}>
                {endingSession ? 'Finalizando...' : 'Finalizar Trabalho'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sessionInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  sessionText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4caf50',
  },
  pauseButton: {
    backgroundColor: '#ff9800',
  },
  resumeButton: {
    backgroundColor: '#2196f3',
  },
  endButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
