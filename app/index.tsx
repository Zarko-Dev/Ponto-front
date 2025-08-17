import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  
  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (isAuthenticated && global.token) {
      console.log('ℹ️ LoginScreen: Usuário já autenticado, redirecionando...');
      router.replace('/dashboard');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('❌ LoginScreen: Campos obrigatórios não preenchidos');
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    console.log('🚀 LoginScreen: Iniciando processo de login...', { email });
    setLoading(true);
    
    try {
      console.log('📞 LoginScreen: Chamando função login do contexto...');
      const success = await login(email, password);
      
      console.log('📊 LoginScreen: Resultado do login:', { success });
      
      if (success) {
        console.log('✅ LoginScreen: Login bem-sucedido! Redirecionando...');
        router.replace('/dashboard');
      } else {
        console.log('❌ LoginScreen: Login falhou - credenciais incorretas');
        Alert.alert('Erro', 'Email ou senha incorretos');
      }
    } catch (error) {
      console.error('💥 LoginScreen: Erro durante o login:', error);
      Alert.alert('Erro', 'Falha no login. Tente novamente.');
    } finally {
      console.log('🏁 LoginScreen: Processo de login finalizado');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header com ícone e nome do app */}
        <View style={styles.header}>
          <Ionicons name="time-outline" size={64} color="#9b59b6" />
          <Text style={styles.appName}>PontoApp</Text>
          <Text style={styles.subtitle}>Controle de Ponto Eletrônico</Text>
        </View>
        
        {/* Formulário de login */}
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Fazer Login</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Ionicons 
              name={loading ? "hourglass-outline" : "log-in-outline"} 
              size={20} 
              color="#fff" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
  loginCard: {
    backgroundColor: '#1c1c1e',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#2c2c2e',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#9b59b6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#9b59b6',
    fontSize: 14,
  },
});
