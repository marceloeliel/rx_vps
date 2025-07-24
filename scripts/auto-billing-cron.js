#!/usr/bin/env node

/**
 * Script de cobrança automática para assinaturas RX Veículos
 * 
 * Este script deve ser executado diariamente via cron job para:
 * 1. Verificar assinaturas vencidas e criar cobranças automáticas
 * 2. Bloquear assinaturas que excederam o período de tolerância
 * 
 * Uso:
 * node scripts/auto-billing-cron.js
 * 
 * Cron job sugerido (todo dia às 9h):
 * 0 9 * * * /usr/bin/node /caminho/para/projeto/scripts/auto-billing-cron.js
 */

const https = require('https')
const http = require('http')

// Configurações
const CONFIG = {
  // URL da API (ajustar conforme ambiente)
  API_URL: process.env.API_URL || 'http://localhost:3000',
  
  // Chave secreta para autorização do cron
  CRON_SECRET: process.env.CRON_SECRET_KEY || 'your-secret-key-here',
  
  // Timeout para requisições (30 segundos)
  TIMEOUT: 30000
}

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const lib = isHttps ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.CRON_SECRET}`,
        ...options.headers
      },
      timeout: CONFIG.TIMEOUT
    }

    const req = lib.request(requestOptions, (res) => {
      let data = ''
      
      res.on('data', chunk => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            body: JSON.parse(data)
          }
          resolve(result)
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            body: data
          })
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

// Função principal
async function runAutoBilling() {
  console.log(`[${new Date().toISOString()}] Iniciando processamento de cobrança automática...`)
  
  try {
    // Fazer requisição para API de cobrança automática
    const response = await makeRequest(`${CONFIG.API_URL}/api/subscriptions/auto-billing`, {
      method: 'POST'
    })

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Processamento concluído com sucesso!')
      console.log('📊 Resultados:', JSON.stringify(response.body.results, null, 2))
      
      // Log detalhado dos resultados
      const results = response.body.results
      if (results) {
        console.log(`📈 Estatísticas:`)
        console.log(`   - Assinaturas expiradas encontradas: ${results.totalExpired}`)
        console.log(`   - Cobranças criadas: ${results.processedExpired}`)
        console.log(`   - Assinaturas bloqueadas: ${results.processedBlocked}`)
        
        if (results.errors && results.errors.length > 0) {
          console.log(`⚠️  Erros encontrados (${results.errors.length}):`)
          results.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`)
          })
        }
      }
    } else if (response.statusCode === 401) {
      console.error('❌ Erro de autorização. Verifique CRON_SECRET_KEY.')
      process.exit(1)
    } else {
      console.error(`❌ Erro na API (${response.statusCode}):`, response.body)
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Erro ao executar cobrança automática:', error.message)
    
    // Tentar verificar se API está funcionando
    try {
      console.log('🔍 Verificando status da API...')
      const statusResponse = await makeRequest(`${CONFIG.API_URL}/api/subscriptions/auto-billing`)
      
      if (statusResponse.statusCode === 200) {
        console.log('✅ API respondendo normalmente')
        console.log('📊 Status:', JSON.stringify(statusResponse.body.statistics, null, 2))
      } else {
        console.error('❌ API não está respondendo corretamente')
      }
    } catch (statusError) {
      console.error('❌ Não foi possível verificar status da API:', statusError.message)
    }
    
    process.exit(1)
  }
}

// Função para verificar configuração
function checkConfig() {
  const requiredVars = ['API_URL', 'CRON_SECRET']
  const missing = []
  
  requiredVars.forEach(varName => {
    if (!CONFIG[varName] || CONFIG[varName] === 'your-secret-key-here') {
      missing.push(varName)
    }
  })
  
  if (missing.length > 0) {
    console.error('❌ Configuração incompleta!')
    console.error('   Variáveis necessárias:', missing.join(', '))
    console.error('   Configure as variáveis de ambiente ou edite o script.')
    process.exit(1)
  }
  
  console.log('✅ Configuração verificada')
  console.log(`   API URL: ${CONFIG.API_URL}`)
  console.log(`   Timeout: ${CONFIG.TIMEOUT}ms`)
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Script de Cobrança Automática RX Veículos

Uso:
  node scripts/auto-billing-cron.js [opções]

Opções:
  --help, -h     Mostrar esta ajuda
  --check, -c    Apenas verificar configuração
  --status, -s   Verificar status da API

Variáveis de ambiente:
  API_URL           URL da API (padrão: http://localhost:3000)
  CRON_SECRET_KEY   Chave secreta para autorização

Exemplo de cron job (todo dia às 9h):
  0 9 * * * /usr/bin/node /caminho/para/projeto/scripts/auto-billing-cron.js

`)
  process.exit(0)
}

if (args.includes('--check') || args.includes('-c')) {
  console.log('🔍 Verificando configuração...')
  checkConfig()
  console.log('✅ Configuração OK!')
  process.exit(0)
}

if (args.includes('--status') || args.includes('-s')) {
  console.log('🔍 Verificando status da API...')
  makeRequest(`${CONFIG.API_URL}/api/subscriptions/auto-billing`)
    .then(response => {
      console.log('📊 Status da API:', JSON.stringify(response.body, null, 2))
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Erro ao verificar status:', error.message)
      process.exit(1)
    })
  return
}

// Executar processamento
checkConfig()
runAutoBilling() 