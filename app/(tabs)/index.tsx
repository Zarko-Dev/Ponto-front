import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';

export default function Home() {
  const [time, setTime] = useState(new Date());
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { currentSession, loading, startSession, endSession, getTodayRecords, refreshSessions, clearCurrentSession } = useSession();
  
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated && !global.token) {
      console.log('⚠️ Dashboard: Usuário não autenticado, redirecionando para login...');
      router.replace('/');
    }
  }, [isAuthenticated]);
  
  // Calcular estatísticas do dia
  const todayRecords = getTodayRecords();
  const entradas = todayRecords.filter(record => record.recordType === 'ENTRADA').length;
  const saidas = todayRecords.filter(record => record.recordType === 'SAIDA').length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEntrada = async () => {
    console.log('🏃 Dashboard: Botão Entrada clicado');
    
    if (currentSession) {
      Alert.alert(
        'Sessão Já Ativa', 
        `Você já registrou entrada às ${new Date(currentSession.startTime).toLocaleTimeString()}. Use o botão "Saída" para finalizar.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (loading) {
      console.log('⏳ Dashboard: Aguardando operação em andamento...');
      return;
    }
    
    console.log('📝 Dashboard: Iniciando processo de entrada...');
    const success = await startSession();
    
    if (success) {
      console.log('✅ Dashboard: Entrada registrada com sucesso');
      Alert.alert('Sucesso', 'Entrada registrada com sucesso!');
    } else {
      console.log('❌ Dashboard: Erro ao registrar entrada');
      // Não mostrar erro se for problema de sincronização
      if (!currentSession) {
        Alert.alert('Erro', 'Não foi possível registrar a entrada. Verifique sua conexão e tente novamente.');
      }
    }
  };

  const handleSaida = async () => {
    console.log('🚪 Dashboard: Botão Saída clicado');
    
    if (!currentSession) {
      console.log('⚠️ Dashboard: Nenhuma sessão ativa para finalizar');
      Alert.alert('Atenção', 'Você precisa registrar uma entrada primeiro.');
      return;
    }
    
    if (loading) {
      console.log('⏳ Dashboard: Aguardando operação em andamento...');
      return;
    }
    
    console.log('📋 Dashboard: Exibindo confirmação de saída...');
    Alert.alert(
      'Confirmar Saída',
      'Deseja registrar sua saída?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => console.log('❌ Dashboard: Saída cancelada pelo usuário')
        },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            console.log('📝 Dashboard: Iniciando processo de saída...');
            const success = await endSession();
            
            if (success) {
              console.log('✅ Dashboard: Saída registrada com sucesso');
              Alert.alert('Sucesso', 'Saída registrada com sucesso!');
            } else {
              console.log('❌ Dashboard: Erro ao registrar saída');
              Alert.alert('Erro', 'Não foi possível registrar a saída. Tente novamente.');
            }
          }
        },
      ]
    );
  };

  const handleLogout = () => {
    console.log('🚪 Dashboard: Botão logout pressionado');
    
    if (currentSession) {
      // Se há sessão ativa, perguntar se quer encerrar
      Alert.alert(
        'Sessão de Ponto Ativa',
        'Você tem uma sessão de ponto ativa. O que deseja fazer?',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('❌ Dashboard: Logout cancelado')
          },
          { 
            text: 'Sair sem encerrar ponto', 
            onPress: async () => {
              console.log('🚪 Dashboard: Logout sem encerrar sessão...');
              try {
                clearCurrentSession(); // Limpar sessão local
                await logout();
                console.log('✅ Dashboard: Logout concluído, redirecionando...');
                router.push('/'); // Forçar redirecionamento para login
                setTimeout(() => router.replace('/'), 100); // Garantir redirecionamento
              } catch (error) {
                console.error('❌ Dashboard: Erro no logout:', error);
                Alert.alert('Erro', 'Erro ao fazer logout. Tentando novamente...');
                router.replace('/'); // Forçar redirecionamento mesmo com erro
              }
            }
          },
          { 
            text: 'Encerrar ponto e sair',
            style: 'destructive',
            onPress: async () => {
              console.log('🚪 Dashboard: Encerrando sessão e fazendo logout...');
              try {
                const success = await endSession();
                if (success) {
                  Alert.alert('Saída registrada', 'Sessão de ponto encerrada!');
                }
                await logout();
                console.log('✅ Dashboard: Logout concluído, redirecionando...');
                router.push('/'); // Forçar redirecionamento para login
                setTimeout(() => router.replace('/'), 100); // Garantir redirecionamento
              } catch (error) {
                console.error('❌ Dashboard: Erro no logout:', error);
                Alert.alert('Erro', 'Erro ao fazer logout. Tentando novamente...');
                router.replace('/'); // Forçar redirecionamento mesmo com erro
              }
            }
          },
        ]
      );
    } else {
      // Se não há sessão ativa, logout simples
      Alert.alert(
        'Confirmar Logout',
        'Deseja sair do sistema?',
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => console.log('❌ Dashboard: Logout cancelado')
          },
          { 
            text: 'Sair', 
            style: 'destructive',
            onPress: async () => {
              console.log('🚪 Dashboard: Fazendo logout...');
              try {
                clearCurrentSession(); // Limpar sessão local
                await logout();
                console.log('✅ Dashboard: Logout concluído, redirecionando...');
                router.replace('/'); // Forçar redirecionamento
              } catch (error) {
                console.error('❌ Dashboard: Erro no logout:', error);
                Alert.alert('Erro', 'Erro ao fazer logout. Tentando novamente...');
                router.replace('/'); // Forçar redirecionamento mesmo com erro
              }
            }
          },
        ]
      );
    }
  };

  // Logout de emergência - direto sem perguntas
  const handleEmergencyLogout = async () => {
    console.log('🊑 Dashboard: LOGOUT DE EMERGÊNCIA - Forçando saída imediata...');
    
    // Mostrar alerta de confirmação
    Alert.alert(
      '🊑 LOGOUT DE EMERGÊNCIA',
      'Fazendo logout e redirecionando para login...',
      [{ text: 'OK' }]
    );
    
    try {
      // Limpar sessão local imediatamente
      clearCurrentSession();
      console.log('✅ Dashboard: Sessão local limpa');
      
      // Forçar limpeza do token
      global.token = null;
      console.log('✅ Dashboard: Token global limpo');
      
      // Tentar logout na API (mas não aguardar)
      logout().catch(error => console.warn('⚠️ Dashboard: Erro no logout da API (ignorado):', error));
      
      // ABORDAGEM AGRESSIVA: Forçar limpeza completa
      console.log('✅ Dashboard: Forçando limpeza completa...');
      
      // Se estivermos no navegador, recarregar a página
      if (typeof window !== 'undefined' && window.location) {
        console.log('🌐 Dashboard: Executando no navegador, recarregando página...');
        window.location.href = '/';
        return;
      }
      
      // Para mobile: Múltiplas tentativas de redirecionamento
      console.log('📱 Dashboard: Executando no mobile, forçando redirecionamentos...');
      
      // Tentativa 1: Limpar stack completamente
      try {
        router.dismissAll();
        router.canGoBack() && router.back();
      } catch (e) {
        console.warn('⚠️ Erro ao limpar stack:', e);
      }
      
      // Tentativa 2: Push seguido de replace
      router.push('/');
      setTimeout(() => router.replace('/'), 100);
      
      // Tentativa 3: Backup com timeout maior
      setTimeout(() => {
        router.replace('/');
        console.log('✅ Dashboard: Redirecionamento de backup 1 executado');
      }, 500);
      
      // Tentativa 4: Último recurso
      setTimeout(() => {
        router.replace('/');
        console.log('✅ Dashboard: Redirecionamento de backup 2 executado');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Dashboard: Erro no logout de emergência:', error);
      
      // Último recurso: recarregar página se possível
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      } else {
        // Para mobile: forçar redirecionamentos múltiplos
        router.replace('/');
        setTimeout(() => router.replace('/'), 500);
        setTimeout(() => router.replace('/'), 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View>
          <Text style={styles.welcomeText}>Olá, {currentUser?.nome}</Text>
          <Text style={styles.userInfo}>Jornada: {currentUser?.jornada}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#e056fd" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleEmergencyLogout} 
            style={[styles.logoutButton, { 
              backgroundColor: '#ff4444', 
              borderRadius: 8, 
              paddingHorizontal: 12, 
              paddingVertical: 6
            }]}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🊑 SAIR</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* App Header */}
      <Ionicons name="time-outline" size={36} color="#9b59b6" />
      <Text style={styles.appName}>PontoApp</Text>
      <Text style={styles.subtitle}>Controle de Ponto Eletrônico</Text>

      {/* Relógio */}
      <View style={styles.card}>
        <Text style={styles.clock}>{time.toLocaleTimeString()}</Text>
        <Text style={styles.date}>
          {time.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Text style={styles.location}>
          <Ionicons name="location-outline" size={14} color="#aaa" /> Escritório
          Central
        </Text>
      </View>

      {/* Último registro */}
      <View style={styles.card}>
        <View style={styles.lastRow}>
          <MaterialCommunityIcons
            name={currentSession ? "login" : "clock-outline"}
            size={22}
            color={currentSession ? "#9b59b6" : "#aaa"}
          />
          <Text style={styles.lastRegister}>
            Status atual:{" "}
            {currentSession ? "Trabalhando" : "Fora do horário"}
          </Text>
        </View>
        <Text style={styles.status}>
          {currentSession
            ? `Entrada registrada às ${new Date(currentSession.startTime).toLocaleTimeString()}`
            : "Nenhuma sessão ativa"}
        </Text>
      </View>

      {/* Botões */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button, 
            styles.buttonIn,
            loading || currentSession ? styles.buttonDisabled : null
          ]}
          onPress={handleEntrada}
          disabled={loading || !!currentSession}
        >
          <Ionicons 
            name={loading ? "hourglass-outline" : "log-in-outline"} 
            size={24} 
            color={loading || currentSession ? "#aaa" : "#fff"} 
          />
          <Text style={[
            styles.buttonText,
            (loading || currentSession) ? styles.buttonTextDisabled : null
          ]}>
            {loading ? "Processando..." : "Entrada"}
          </Text>
          <Text style={[
            styles.buttonSub,
            (loading || currentSession) ? styles.buttonSubDisabled : null
          ]}>
            {currentSession ? "Já dentro" : "Registrar chegada"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button, 
            styles.buttonOut,
            loading || !currentSession ? styles.buttonDisabled : null
          ]}
          onPress={handleSaida}
          disabled={loading || !currentSession}
        >
          <Ionicons 
            name={loading ? "hourglass-outline" : "log-out-outline"} 
            size={24} 
            color={loading || !currentSession ? "#aaa" : "#fff"} 
          />
          <Text style={[
            styles.buttonText,
            (loading || !currentSession) ? styles.buttonTextDisabled : null
          ]}>
            {loading ? "Processando..." : "Saída"}
          </Text>
          <Text style={[
            styles.buttonSub,
            (loading || !currentSession) ? styles.buttonSubDisabled : null
          ]}>
            {!currentSession ? "Entre primeiro" : "Registrar saída"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resumo */}
      <View style={styles.card}>
        <Text style={styles.resumeTitle}>
          <Ionicons name="stats-chart-outline" size={18} color="#9b59b6" />{" "}
          Resumo de Hoje
        </Text>
        <View style={styles.resumeRow}>
          <Text style={styles.resumeIn}>
            <Ionicons name="arrow-down-circle" size={16} color="#9b59b6" /> 
            Entradas: {entradas}
          </Text>
          <Text style={styles.resumeOut}>
            <Ionicons name="arrow-up-circle" size={16} color="#e056fd" /> Saídas: 
            {saidas}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: 20,
    alignItems: "center",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    fontSize: 14,
    color: "#9b59b6",
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1c1c1e",
    width: "100%",
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
  },
  clock: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  date: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 5,
  },
  location: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  lastRegister: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#fff",
  },
  status: {
    fontSize: 14,
    color: "#ccc",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonIn: {
    backgroundColor: "#9b59b6",
  },
  buttonOut: {
    backgroundColor: "#8e44ad",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
  },
  buttonSub: {
    fontSize: 12,
    color: "#eee",
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
  },
  resumeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  resumeIn: {
    fontSize: 14,
    color: "#9b59b6",
    fontWeight: "bold",
  },
  resumeOut: {
    fontSize: 14,
    color: "#e056fd",
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#444",
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: "#aaa",
  },
  buttonSubDisabled: {
    color: "#666",
  },
});
