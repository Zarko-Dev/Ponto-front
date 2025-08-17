import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [entrada, setEntrada] = useState<string | null>(null);
  const [saida, setSaida] = useState<string | null>(null);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEntrada = () => {
    setEntrada(time.toLocaleTimeString());
    setSaida(null);
  };

  const handleSaida = () => {
    setSaida(time.toLocaleTimeString());
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Deseja sair do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View>
          <Text style={styles.welcomeText}>Olá, {currentUser?.nome}</Text>
          <Text style={styles.userInfo}>Jornada: {currentUser?.jornada}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#e056fd" />
        </TouchableOpacity>
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
            name={saida ? "logout" : entrada ? "login" : "clock-outline"}
            size={22}
            color={saida ? "#e056fd" : entrada ? "#9b59b6" : "#aaa"}
          />
          <Text style={styles.lastRegister}>
            Último registro:{" "}
            {saida ? "Saída" : entrada ? "Entrada" : "Nenhum"}
          </Text>
        </View>
        <Text style={styles.status}>
          {saida
            ? `Saída registrada às ${saida}`
            : entrada
            ? `Entrada registrada às ${entrada}`
            : "Ainda não registrado"}
        </Text>
      </View>

      {/* Botões */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonIn]}
          onPress={handleEntrada}
        >
          <Ionicons name="log-in-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Entrada</Text>
          <Text style={styles.buttonSub}>Registrar chegada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOut]}
          onPress={handleSaida}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Saída</Text>
          <Text style={styles.buttonSub}>Registrar saída</Text>
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
            <Ionicons name="arrow-down-circle" size={16} color="#9b59b6" />{" "}
            Entradas: {entrada ? 1 : 0}
          </Text>
          <Text style={styles.resumeOut}>
            <Ionicons name="arrow-up-circle" size={16} color="#e056fd" /> Saídas:{" "}
            {saida ? 1 : 0}
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
});
