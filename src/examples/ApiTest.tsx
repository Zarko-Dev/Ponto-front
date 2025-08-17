import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useApi } from '../hooks/useApi';
import authService from '../services/authService';
import sessionService from '../services/sessionService';
import userService from '../services/userService';

export default function ApiTest() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  // Hooks para autenticação
  const { execute: login, loading: loginLoading, error: loginError } = useApi(authService.login);
  const { execute: register, loading: registerLoading, error: registerError } = useApi(authService.register);
  const { execute: getCurrentUser, loading: userLoading, error: userError } = useApi(authService.getCurrentUser);

  // Hooks para sessões
  const { execute: startSession, loading: startLoading } = useApi(sessionService.startSession);
  const { execute: getMySessions, loading: sessionsLoading } = useApi(sessionService.getMySessions);

  // Hooks para usuários
  const { execute: getUsers, loading: usersLoading } = useApi(userService.getUsers);

  const handleLogin = async () => {
    const result = await login({
      email: 'admin@example.com',
      password: '123456'
    });
    
    if (result) {
      setCurrentUser(result.user);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    }
  };

  const handleRegister = async () => {
    const result = await register({
      name: 'Usuário Teste',
      email: 'teste@example.com',
      password: '123456'
    });
    
    if (result) {
      setCurrentUser(result.user);
      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
    }
  };

  const handleGetCurrentUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
      Alert.alert('Sucesso', 'Usuário atual obtido!');
    }
  };

  const handleStartSession = async () => {
    const session = await startSession();
    if (session) {
      Alert.alert('Sucesso', 'Sessão iniciada com sucesso!');
      // Recarregar sessões
      handleGetSessions();
    }
  };

  const handleGetSessions = async () => {
    const result = await getMySessions();
    if (result) {
      setSessions(result);
      Alert.alert('Sucesso', `${result.length} sessões encontradas!`);
    }
  };

  const handleGetUsers = async () => {
    const result = await getUsers();
    if (result) {
      Alert.alert('Sucesso', `${result.length} usuários encontrados!`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setSessions([]);
    Alert.alert('Sucesso', 'Logout realizado com sucesso!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Teste da API</Text>

      {/* Status do Usuário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status do Usuário</Text>
        {currentUser ? (
          <View style={styles.userInfo}>
            <Text>Nome: {currentUser.name}</Text>
            <Text>Email: {currentUser.email}</Text>
            <Text>Role: {currentUser.role}</Text>
          </View>
        ) : (
          <Text style={styles.noUser}>Nenhum usuário logado</Text>
        )}
      </View>

      {/* Autenticação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Autenticação</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.loginButton, loginLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loginLoading}
        >
          <Text style={styles.buttonText}>
            {loginLoading ? 'Fazendo Login...' : 'Login (admin@example.com)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton, registerLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={registerLoading}
        >
          <Text style={styles.buttonText}>
            {registerLoading ? 'Registrando...' : 'Registrar Usuário'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.userButton, userLoading && styles.buttonDisabled]}
          onPress={handleGetCurrentUser}
          disabled={userLoading}
        >
          <Text style={styles.buttonText}>
            {userLoading ? 'Carregando...' : 'Obter Usuário Atual'}
          </Text>
        </TouchableOpacity>

        {currentUser && (
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        )}

        {loginError && <Text style={styles.error}>Erro no Login: {loginError}</Text>}
        {registerError && <Text style={styles.error}>Erro no Registro: {registerError}</Text>}
        {userError && <Text style={styles.error}>Erro ao obter usuário: {userError}</Text>}
      </View>

      {/* Sessões */}
      {currentUser && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessões de Trabalho</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.sessionButton, startLoading && styles.buttonDisabled]}
            onPress={handleStartSession}
            disabled={startLoading}
          >
            <Text style={styles.buttonText}>
              {startLoading ? 'Iniciando...' : 'Iniciar Sessão'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.sessionButton, sessionsLoading && styles.buttonDisabled]}
            onPress={handleGetSessions}
            disabled={sessionsLoading}
          >
            <Text style={styles.buttonText}>
              {sessionsLoading ? 'Carregando...' : 'Obter Minhas Sessões'}
            </Text>
          </TouchableOpacity>

          {sessions.length > 0 && (
            <View style={styles.sessionsList}>
              <Text style={styles.sessionsTitle}>Sessões ({sessions.length}):</Text>
              {sessions.map((session, index) => (
                <View key={session.id || index} style={styles.sessionItem}>
                  <Text>ID: {session.id}</Text>
                  <Text>Início: {new Date(session.startTime).toLocaleString('pt-BR')}</Text>
                  {session.endTime && (
                    <Text>Fim: {new Date(session.endTime).toLocaleString('pt-BR')}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Usuários (Admin) */}
      {currentUser?.role === 'ADMIN' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciamento de Usuários (Admin)</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.adminButton, usersLoading && styles.buttonDisabled]}
            onPress={handleGetUsers}
            disabled={usersLoading}
          >
            <Text style={styles.buttonText}>
              {usersLoading ? 'Carregando...' : 'Listar Usuários'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Informações da API */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da API</Text>
        <Text>URL Base: {authService.getToken() ? 'Configurada' : 'Não configurada'}</Text>
        <Text>Token: {authService.getToken() ? 'Presente' : 'Ausente'}</Text>
        <Text>Autenticado: {authService.isAuthenticated() ? 'Sim' : 'Não'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
  },
  noUser: {
    fontStyle: 'italic',
    color: '#666',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#4caf50',
  },
  registerButton: {
    backgroundColor: '#2196f3',
  },
  userButton: {
    backgroundColor: '#ff9800',
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  sessionButton: {
    backgroundColor: '#9c27b0',
  },
  adminButton: {
    backgroundColor: '#607d8b',
  },
  error: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  sessionsList: {
    marginTop: 15,
  },
  sessionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sessionItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
});
