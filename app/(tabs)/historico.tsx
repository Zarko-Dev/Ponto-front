import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from '@/contexts/SessionContext';
import { TimeRecord } from '../src/services/sessionService';
import { useFocusEffect } from '@react-navigation/native';

interface RegistroFormatado {
  id: string;
  tipo: string;
  data: string;
  local: string;
  hora: string;
  timestamp: Date;
}

export default function HistoricoScreen() {
  const { sessions, loading, refreshSessions } = useSession();
  const [refreshing, setRefreshing] = useState(false);

  // Converter sessões e registros para formato da tela
  const formatarRegistros = (): RegistroFormatado[] => {
    const registrosFormatados: RegistroFormatado[] = [];
    
    sessions.forEach(session => {
      session.timeRecords.forEach(record => {
        const timestamp = new Date(record.timestamp);
        let tipo = '';
        
        switch (record.recordType) {
          case 'ENTRADA':
            tipo = 'Entrada';
            break;
          case 'SAIDA':
            tipo = 'Saída';
            break;
          case 'PAUSA_INICIO':
            tipo = 'Pausa Início';
            break;
          case 'PAUSA_FIM':
            tipo = 'Pausa Fim';
            break;
        }
        
        registrosFormatados.push({
          id: record.id.toString(),
          tipo,
          data: timestamp.toLocaleDateString('pt-BR'),
          local: 'Escritório Central',
          hora: timestamp.toLocaleTimeString('pt-BR'),
          timestamp
        });
      });
    });
    
    // Ordenar por timestamp desc (mais recente primeiro)
    return registrosFormatados.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  };

  const registros = formatarRegistros();

  const onRefresh = async () => {
    console.log('🔄 Histórico: Atualizando dados...');
    setRefreshing(true);
    try {
      await refreshSessions(true); // Forçar atualização
      console.log('✅ Histórico: Dados atualizados');
    } catch (error) {
      console.error('❌ Histórico: Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Atualizar automaticamente quando a tela ganhar foco (com debounce)
  useFocusEffect(
    React.useCallback(() => {
      console.log('👁️ Histórico: Tela ganhou foco, atualizando...');
      const timeoutId = setTimeout(() => {
        refreshSessions();
      }, 300); // Delay para evitar múltiplas chamadas
      
      return () => clearTimeout(timeoutId);
    }, [refreshSessions])
  );

  const renderItem = ({ item }: { item: RegistroFormatado }) => {
    const isEntrada = item.tipo === 'Entrada';
    const isPausa = item.tipo.includes('Pausa');
    
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons
            name={
              isEntrada ? "log-in-outline" : 
              item.tipo === 'Saída' ? "log-out-outline" :
              isPausa ? "pause-circle-outline" : "time-outline"
            }
            size={24}
            color={
              isEntrada ? "#9b59b6" : 
              item.tipo === 'Saída' ? "#e056fd" :
              isPausa ? "#f39c12" : "#aaa"
            }
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.tipo}>{item.tipo}</Text>
            <Text style={styles.data}>{item.data}</Text>
            <Text style={styles.local}>{item.local}</Text>
          </View>
          <View style={{ marginLeft: "auto", alignItems: "flex-end" }}>
            <Text style={styles.hora}>{item.hora}</Text>
            <View
              style={[
                styles.tag,
                {
                  backgroundColor:
                    isEntrada ? "#9b59b6" : 
                    item.tipo === 'Saída' ? "#e056fd" :
                    isPausa ? "#f39c12" : "#aaa",
                },
              ]}
            >
              <Text style={styles.tagText}>{item.tipo}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing && registros.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#9b59b6" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Registros</Text>
      {registros.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={64} color="#aaa" />
          <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
          <Text style={styles.emptySubtext}>Faça seu primeiro registro de ponto!</Text>
        </View>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#9b59b6']}
              tintColor="#9b59b6"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f", // fundo escuro
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#fff", // título branco
  },
  card: {
    backgroundColor: "#1c1c1e", // cartão escuro
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  data: {
    fontSize: 14,
    color: "#aaa",
  },
  local: {
    fontSize: 13,
    color: "#888",
  },
  hora: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  tag: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
