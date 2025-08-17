import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, User } from '@/contexts/AuthContext';

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  editUser?: User | null;
}

export default function AddUserModal({ visible, onClose, editUser }: AddUserModalProps) {
  const { addUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    jornada: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editUser) {
      setFormData({
        nome: editUser.nome,
        cpf: editUser.cpf,
        email: editUser.email,
        jornada: editUser.jornada,
        senha: editUser.senha,
      });
    } else {
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        jornada: '8h/dia',
        senha: '',
      });
    }
  }, [editUser, visible]);

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      Alert.alert('Erro', 'CPF é obrigatório');
      return false;
    }
    if (formData.cpf.length !== 14) {
      Alert.alert('Erro', 'CPF deve ter 11 dígitos');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }
    if (!formData.jornada.trim()) {
      Alert.alert('Erro', 'Jornada de trabalho é obrigatória');
      return false;
    }
    if (!formData.senha.trim()) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return false;
    }
    if (formData.senha.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editUser) {
        updateUser(editUser.id, {
          ...formData,
          isAdmin: false,
        });
        Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      } else {
        addUser({
          ...formData,
          isAdmin: false,
        });
        Alert.alert('Sucesso', 'Usuário adicionado com sucesso!');
      }
      
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const journeyOptions = [
    '6h/dia',
    '8h/dia',
    '8h48/dia',
    '4h/dia',
    '6h/dia - Meio período',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editUser ? 'Editar Usuário' : 'Adicionar Usuário'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              placeholderTextColor="#aaa"
              value={formData.nome}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
              autoCapitalize="words"
            />
          </View>

          {/* CPF */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#aaa"
              value={formData.cpf}
              onChangeText={handleCPFChange}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="usuario@empresa.com"
              placeholderTextColor="#aaa"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.toLowerCase() }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Jornada de Trabalho */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jornada de Trabalho</Text>
            <View style={styles.journeyContainer}>
              {journeyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.journeyOption,
                    formData.jornada === option && styles.journeyOptionSelected,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, jornada: option }))}
                >
                  <Text
                    style={[
                      styles.journeyOptionText,
                      formData.jornada === option && styles.journeyOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha de Acesso</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#aaa"
              value={formData.senha}
              onChangeText={(text) => setFormData(prev => ({ ...prev, senha: text }))}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Ionicons 
                name={loading ? "hourglass-outline" : "checkmark-circle-outline"} 
                size={20} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : editUser ? 'Atualizar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  journeyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  journeyOption: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  journeyOptionSelected: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  journeyOptionText: {
    fontSize: 14,
    color: '#aaa',
  },
  journeyOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#9b59b6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonDisabled: {
    backgroundColor: '#555',
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
