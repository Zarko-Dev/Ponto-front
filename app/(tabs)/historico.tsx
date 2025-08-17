import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const registros = [
  {
    id: "1",
    tipo: "Entrada",
    data: "15/01/2024",
    local: "Escritório Central",
    hora: "08:30:15",
  },
  {
    id: "2",
    tipo: "Saída",
    data: "15/01/2024",
    local: "Escritório Central",
    hora: "12:00:45",
  },
  {
    id: "3",
    tipo: "Entrada",
    data: "15/01/2024",
    local: "Escritório Central",
    hora: "13:15:20",
  },
];

interface Registro {
  id: string;
  tipo: string;
  data: string;
  local: string;
  hora: string;
}

export default function TabTwoScreen() {
  const renderItem = ({ item } : { item: Registro }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name={item.tipo === "Entrada" ? "log-in-outline" : "log-out-outline"}
          size={24}
          color={item.tipo === "Entrada" ? "#9b59b6" : "#e056fd"} // roxo/rosa
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
                  item.tipo === "Entrada" ? "#9b59b6" : "#e056fd",
              },
            ]}
          >
            <Text style={styles.tagText}>{item.tipo}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Registros</Text>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
});
