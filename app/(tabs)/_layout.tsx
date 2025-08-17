import { Tabs, router } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();

  // Proteção de rota - redirecionar se não autenticado
  useEffect(() => {
    console.log('🛡️ TabLayout: Verificando autenticação...', { isAuthenticated, token: !!global.token });
    
    if (isAuthenticated === false || (!isAuthenticated && !global.token)) {
      console.log('🚨 TabLayout: Usuário não autenticado! Redirecionando para login...');
      // Forçar redirecionamento para login com limpeza de stack
      router.dismissAll();
      router.replace('/');
    }
  }, [isAuthenticated]);

  // Se não está autenticado, não renderizar as abas
  if (isAuthenticated === false || (!isAuthenticated && !global.token)) {
    console.log('⏳ TabLayout: Aguardando redirecionamento...');
    return null; // Não renderizar nada enquanto redireciona
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
