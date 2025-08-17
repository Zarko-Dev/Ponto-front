// Configurações de ambiente
export const ENV = {
  // Ambiente atual
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // URLs da API
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002',
  
  // Timeouts
  API_TIMEOUT: 10000,
  
  // Configurações de autenticação
  JWT_EXPIRY: '1d',
  
  // Configurações de paginação
  DEFAULT_PAGE_SIZE: 20,
  
  // Configurações de cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

// Configurações específicas por ambiente
export const CONFIG = {
  development: {
    API_URL: 'http://localhost:3002',
    LOG_LEVEL: 'debug',
    ENABLE_MOCK: true,
  },
  production: {
    API_URL: 'https://sua-api-producao.com',
    LOG_LEVEL: 'error',
    ENABLE_MOCK: false,
  },
  test: {
    API_URL: 'http://localhost:3001',
    LOG_LEVEL: 'debug',
    ENABLE_MOCK: true,
  },
};

// Função para obter configuração baseada no ambiente
export function getConfig() {
  return CONFIG[ENV.NODE_ENV as keyof typeof CONFIG] || CONFIG.development;
}

// Função para verificar se está em desenvolvimento
export function isDevelopment(): boolean {
  return ENV.NODE_ENV === 'development';
}

// Função para verificar se está em produção
export function isProduction(): boolean {
  return ENV.NODE_ENV === 'production';
}

// Função para verificar se está em teste
export function isTest(): boolean {
  return ENV.NODE_ENV === 'test';
}
