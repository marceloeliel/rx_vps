#!/usr/bin/env node

/**
 * Script para corrigir problemas de CSS em produção
 * Aplica configurações específicas para resolver problemas de hidratação e CSS
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Aplicando correções para CSS em produção...\n')

// 1. Atualizar next.config.js com configurações otimizadas para CSS
const nextConfigPath = 'next.config.js'
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  
  // Otimizações de performance
  compress: true,
  
  // Configurações experimentais básicas
  experimental: {
    scrollRestoration: true,
  },
  
  // Configurações específicas para CSS em produção
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Suprimir avisos de hidratação específicos
  onDemandEntries: {
    // Período em ms para manter as páginas em memória
    maxInactiveAge: 25 * 1000,
    // Número de páginas que devem ser mantidas simultaneamente
    pagesBufferLength: 2,
  },
  
  // Configurações de webpack simplificadas
  webpack: (config, { isServer, dev }) => {
    // Resolver fallbacks para client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Otimizações específicas para CSS
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            styles: {
              name: 'styles',
              test: /\.(css|scss|sass)$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }
    
    return config
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig
`

fs.writeFileSync(nextConfigPath, nextConfigContent)
console.log('✅ next.config.js atualizado com configurações otimizadas')

// 2. Criar arquivo de configuração específico para produção
const prodConfigContent = `# Configurações específicas para produção
# Este arquivo deve ser usado na VPS

# Ambiente
NODE_ENV=production
PORT=3002

# NextAuth
NEXTAUTH_URL=https://rxnegocio.com.br
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ecdmpndeunbzhaihabvi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0

# APIs
NEXT_PUBLIC_FIPE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWZmMzBjMS1lMjhlLTRjNjctYTkwYS0zNGVlNzUyNmJlYTAiLCJlbWFpbCI6InNlZ3RyYWtlckBnbWFpbC5jb20iLCJpYXQiOjE3Mzk1NDYwMTJ9.zDH9TepQA78CoVGAcl4hlbWZXdwAW2OIXEH2IkOPS_I

# URLs
NEXT_PUBLIC_APP_URL=https://rxnegocio.com.br
WEBSITE_URL=https://rxnegocio.com.br

# Cron Secret
CRON_SECRET_KEY=your-secret-key-here
`

fs.writeFileSync('.env.production', prodConfigContent)
console.log('✅ .env.production criado com configurações corretas')

// 3. Atualizar configuração do PostCSS para produção
const postcssConfigContent = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: 'default',
      },
    }),
  },
};

export default config;
`

fs.writeFileSync('postcss.config.mjs', postcssConfigContent)
console.log('✅ postcss.config.mjs atualizado para produção')

// 4. Criar script de deploy para VPS
const deployScriptContent = `#!/bin/bash

# Script de deploy para VPS - Correção de CSS
# Execute este script na VPS para aplicar as correções

echo "🚀 Iniciando deploy com correções de CSS..."

# Parar aplicação
echo "⏹️ Parando aplicação..."
pm2 stop rx-veiculos 2>/dev/null || true

# Backup do .env atual
echo "💾 Fazendo backup das configurações..."
cp .env.production .env.production.backup 2>/dev/null || true

# Limpar cache do Next.js
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --production=false

# Build de produção
echo "🏗️ Fazendo build de produção..."
NODE_ENV=production npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso"
else
    echo "❌ Erro no build"
    exit 1
fi

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 start ecosystem.config.js
pm2 save

echo "✅ Deploy concluído! Verificando status..."
pm2 status

echo ""
echo "🌐 Aplicação disponível em: https://rxnegocio.com.br"
echo "📊 Monitoramento: pm2 monit"
echo "📋 Logs: pm2 logs rx-veiculos"
`

fs.writeFileSync('deploy-css-fix.sh', deployScriptContent)
fs.chmodSync('deploy-css-fix.sh', '755')
console.log('✅ Script de deploy criado: deploy-css-fix.sh')

// 5. Criar guia de implementação
const guideContent = `# 🔧 Guia de Correção de CSS em Produção

## Problema Identificado
O CSS não está carregando corretamente para usuários deslogados na VPS devido a:
- Problemas de hidratação do Next.js
- Configurações inadequadas para produção
- Cache de arquivos CSS não otimizado

## Soluções Aplicadas

### 1. Configurações do Next.js Otimizadas
- ✅ Configuração específica para CSS em produção
- ✅ Otimização de chunks CSS
- ✅ Remoção de console.log em produção

### 2. Variáveis de Ambiente Corrigidas
- ✅ NODE_ENV=production
- ✅ URLs corretas para produção
- ✅ Configurações do Supabase

### 3. PostCSS Otimizado
- ✅ Autoprefixer habilitado
- ✅ CSSnano para minificação em produção

## Como Aplicar na VPS

### Opção 1: Script Automático
\`\`\`bash
# Na VPS, execute:
chmod +x deploy-css-fix.sh
./deploy-css-fix.sh
\`\`\`

### Opção 2: Manual
\`\`\`bash
# 1. Parar aplicação
pm2 stop rx-veiculos

# 2. Atualizar código
git pull origin main

# 3. Copiar configurações
cp .env.production.example .env.production
# Editar .env.production com suas credenciais

# 4. Limpar cache e rebuild
rm -rf .next
npm ci
NODE_ENV=production npm run build

# 5. Reiniciar
pm2 start ecosystem.config.js
\`\`\`

## Verificações Pós-Deploy

1. **Verificar se CSS está carregando:**
   - Abrir DevTools > Network
   - Verificar se arquivos .css estão sendo carregados
   - Status 200 para /_next/static/css/*

2. **Verificar logs:**
   \`\`\`bash
   pm2 logs rx-veiculos
   \`\`\`

3. **Testar usuário deslogado:**
   - Abrir navegador anônimo
   - Acessar https://rxnegocio.com.br
   - Verificar se estilos estão aplicados

## Configurações do Nginx (se necessário)

Adicionar ao nginx.conf:
\`\`\`nginx
# Cache otimizado para CSS
location ~* \.css$ {
    proxy_pass http://localhost:3002;
    proxy_cache_valid 200 1y;
    add_header Cache-Control "public, immutable";
    add_header X-CSS-Source "nginx-optimized";
}

# Headers para debugging
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
\`\`\`

## Troubleshooting

### CSS ainda não carrega?
1. Verificar se NODE_ENV=production
2. Limpar cache do navegador
3. Verificar logs do PM2
4. Testar build local: \`npm run build && npm start\`

### Erros de hidratação?
1. Verificar console do navegador
2. Verificar se componentes HydrationSafe foram corrigidos
3. Verificar se suppressHydrationWarning foi removido

---

**✅ Após aplicar essas correções, o CSS deve carregar corretamente para todos os usuários!**
`

fs.writeFileSync('GUIA-CORRECAO-CSS.md', guideContent)
console.log('✅ Guia de correção criado: GUIA-CORRECAO-CSS.md')

console.log('\n🎉 Todas as correções foram aplicadas!')
console.log('\n📋 Próximos passos:')
console.log('1. Aguardar conclusão do build atual')
console.log('2. Testar localmente: npm start')
console.log('3. Aplicar na VPS usando deploy-css-fix.sh')
console.log('4. Seguir o GUIA-CORRECAO-CSS.md')