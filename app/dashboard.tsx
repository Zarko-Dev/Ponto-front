import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const { isAuthenticated, isAdmin, currentUser } = useAuth();
  const [dotAnim] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);

  useEffect(() => {
    const animations = dotAnim.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -10,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(index * 150),
        ])
      )
    );
    Animated.stagger(150, animations).start();
  }, []);

  // Navegação segura após autenticação
  useEffect(() => {
    if (isAuthenticated === null) return;

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    router.replace(isAdmin ? '/admin' : '/(tabs)');
  }, [isAuthenticated, isAdmin]);

  if (isAuthenticated === null) return null; // aguarda contexto

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="timer-outline" size={72} color="#9b59b6" />
        <Text style={styles.appName}>PontoApp</Text>
        <Text style={styles.welcome}>
          Bem-vindo, {currentUser?.nome}!
        </Text>
        <Text style={styles.loading}>
          {isAdmin ? 'Acessando painel administrativo...' : 'Carregando sistema...'}
        </Text>
        <View style={styles.loadingIndicator}>
          {dotAnim.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { transform: [{ translateY: anim }] },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  welcome: {
    fontSize: 20,
    color: '#9b59b6',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  loading: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  loadingIndicator: {
    flexDirection: 'row',
    marginTop: 30,
    height: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9b59b6',
    marginHorizontal: 6,
  },
});
