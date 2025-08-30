#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de CSS em produção
 * Verifica configurações que podem afetar o carregamento de estilos
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Diagnóstico de CSS - RX Veículos\n')

// 1. Verificar arquivos de configuração
console.log('📋 Verificando arquivos de configuração:')

const configFiles = [
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.mjs',
  '.env.local',
  'package.json'
]

configFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`   ${exists ? '✅' : '❌'} ${file}`)
})

// 2. Verificar diretórios importantes
console.log('\n📁 Verificando estrutura de diretórios:')

const dirs = [
  'app',
  'components',
  'styles',
  'public',
  '.next'
]

dirs.forEach(dir => {
  const exists = fs.existsSync(dir)
  console.log(`   ${exists ? '✅' : '❌'} ${dir}/`)
})

// 3. Verificar arquivos CSS
console.log('\n🎨 Verificando arquivos CSS:')

const cssFiles = [
  'app/globals.css',
  'styles/globals.css'
]

cssFiles.forEach(file => {
  const exists = fs.existsSync(file)
  if (exists) {
    const stats = fs.statSync(file)
    console.log(`   ✅ ${file} (${stats.size} bytes)`)
  } else {
    console.log(`   ❌ ${file}`)
  }
})

// 4. Verificar build do Next.js
console.log('\n🏗️ Verificando build do Next.js:')

const buildDirs = [
  '.next/static',
  '.next/static/css',
  '.next/static/chunks'
]

buildDirs.forEach(dir => {
  const exists = fs.existsSync(dir)
  if (exists) {
    const files = fs.readdirSync(dir)
    console.log(`   ✅ ${dir}/ (${files.length} arquivos)`)
  } else {
    console.log(`   ❌ ${dir}/`)
  }
})

// 5. Verificar configurações específicas
console.log('\n⚙️ Verificando configurações específicas:')

// Verificar next.config.js
if (fs.existsSync('next.config.js')) {
  try {
    const nextConfig = require('./next.config.js')
    console.log(`   ✅ next.config.js carregado`)
    console.log(`   📦 Output: ${nextConfig.output || 'default'}`)
    console.log(`   🗜️ Compress: ${nextConfig.compress || false}`)
  } catch (error) {
    console.log(`   ❌ Erro ao carregar next.config.js: ${error.message}`)
  }
}

// Verificar variáveis de ambiente
console.log('\n🌍 Verificando variáveis de ambiente:')

const envVars = [
  'NODE_ENV',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXTAUTH_URL'
]

envVars.forEach(envVar => {
  const value = process.env[envVar]
  console.log(`   ${value ? '✅' : '❌'} ${envVar}: ${value ? '***definida***' : 'não definida'}`)
})

// 6. Sugestões de correção
console.log('\n💡 Sugestões para resolver problemas de CSS em produção:')
console.log('\n1. 🔄 Rebuild completo:')
console.log('   rm -rf .next && npm run build')

console.log('\n2. 🌐 Verificar configurações do Nginx:')
console.log('   - Headers de cache para arquivos CSS')
console.log('   - Compressão gzip habilitada')
console.log('   - Proxy correto para /_next/static/')

console.log('\n3. 🔧 Verificar variáveis de ambiente na VPS:')
console.log('   - NODE_ENV=production')
console.log('   - NEXTAUTH_URL com domínio correto')

console.log('\n4. 📱 Testar em modo de produção local:')
console.log('   npm run build && npm start')

console.log('\n5. 🐛 Debug específico:')
console.log('   - Verificar Network tab no DevTools')
console.log('   - Verificar se arquivos CSS estão sendo servidos')
console.log('   - Verificar console para erros de hidratação')

console.log('\n✨ Diagnóstico concluído!')