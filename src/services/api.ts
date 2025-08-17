import axios from 'axios';

// Interface para o token global
declare global {
  var token: string | null;
}

import { getConfig } from '../config/environment';

// Configuração base do axios
const config = getConfig();
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    console.log('🔗 API Interceptor: Preparando requisição para', config.url);
    
    // Tentar obter o token (carrega do AsyncStorage se necessário)
    const token = global.token || null;
    
    console.log('🔑 API Interceptor: Token disponível:', token ? 'SIM (' + token.substring(0, 20) + '...)' : 'NÃO');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ API Interceptor: Header Authorization adicionado');
    } else {
      console.log('❌ API Interceptor: Nenhum token disponível');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Interceptor: Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      global.token = null;
      // Aqui você pode adicionar lógica para redirecionar para login
    }
    return Promise.reject(error);
  }
);

export default api;
