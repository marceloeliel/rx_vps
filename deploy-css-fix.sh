#!/bin/bash

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
