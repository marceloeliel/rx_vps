// Configuração da API do Asaas - FORÇAR SANDBOX
export const ASAAS_CONFIG = {
  // URLs da API (conforme documentação oficial)
  SANDBOX_URL: 'https://api-sandbox.asaas.com/v3',
  PRODUCTION_URL: 'https://api.asaas.com/v3',
  
  // Chaves de API (usar variáveis de ambiente em produção)
  SANDBOX_API_KEY: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmI2M2RmYjNlLTgzMjMtNDlhYy04ZWM5LWQyODFhNzUyMDYwZTo6JGFhY2hfY2MyOTEzZDItMjZlMy00ZDQ0LWIzZTctZjdhYjEyNzc2MWIz',
  
  // Ambiente atual (FORÇAR sandbox para desenvolvimento)
  ENVIRONMENT: 'sandbox' as 'sandbox' | 'production',
}

// Função para obter a URL base da API - FORÇAR SANDBOX
export function getAsaasApiUrl(): string {
  // SEMPRE retornar sandbox durante desenvolvimento
  console.log('🔧 [ASAAS-CONFIG] Usando URL sandbox:', ASAAS_CONFIG.SANDBOX_URL)
  return ASAAS_CONFIG.SANDBOX_URL
}

// Função para obter a chave da API - FORÇAR SANDBOX
export function getAsaasApiKey(): string {
  // SEMPRE usar a chave de sandbox durante desenvolvimento
  console.log('🔧 [ASAAS-CONFIG] Usando chave sandbox')
  return ASAAS_CONFIG.SANDBOX_API_KEY
}

// Headers padrão para requisições
export function getAsaasHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'access_token': getAsaasApiKey(),
  }
} 