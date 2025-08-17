import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth, User } from '@/contexts/AuthContext';
import AddUserModal from '@/components/AddUserModal';

export default function AdminDashboard() {
  const { users, currentUser, logout, removeUser, updateUser } = useAuth();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o usuário ${user.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removeUser(user.id),
        },
      ]
    );
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddModalVisible(true);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nome}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userDetails}>CPF: {item.cpf}</Text>
        <Text style={styles.userDetails}>Jornada: {item.jornada}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditUser(item)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#9b59b6" />
          <Text style={styles.title}>Painel Admin</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#e056fd" />
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>
        Olá, {currentUser?.nome}
      </Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color="#9b59b6" />
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Usuários</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person-add-outline" size={24} color="#e056fd" />
          <Text style={styles.statNumber}>+</Text>
          <Text style={styles.statLabel}>Adicionar</Text>
        </View>
      </View>

      {/* Add User Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingUser(null);
          setIsAddModalVisible(true);
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Adicionar Usuário</Text>
      </TouchableOpacity>

      {/* Users List */}
      <Text style={styles.sectionTitle}>Lista de Usuários</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Toque em "Adicionar Usuário" para começar
            </Text>
          </View>
        }
      />

      {/* Add/Edit User Modal */}
      <AddUserModal
        visible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
          setEditingUser(null);
        }}
        editUser={editingUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#aaa',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#9b59b6',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9b59b6',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
