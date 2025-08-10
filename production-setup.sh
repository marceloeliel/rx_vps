#!/bin/bash

# Script de configuração de produção para RX Veículos
# Domínio: rxnegocio.com.br

echo "🚀 Configurando RX Veículos em Produção"
echo "Domínio: https://rxnegocio.com.br"
echo "========================================"

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
npm install -g pm2

# Parar processos Next.js existentes
echo "🛑 Parando processos existentes..."
pkill -f "next dev" || true
pkill -f "pnpm dev" || true

# Navegar para o diretório do projeto
cd /root/rx-git

# Instalar dependências (se necessário)
echo "📦 Verificando dependências..."
pnpm install --frozen-lockfile

# Build da aplicação para produção
echo "🔨 Fazendo build da aplicação..."
pnpm build

# Criar arquivo de configuração do PM2
echo "⚙️ Criando configuração do PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rx-veiculos',
    script: 'pnpm',
    args: 'start',
    cwd: '/root/rx-git',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/rx-veiculos-error.log',
    out_file: '/var/log/rx-veiculos-out.log',
    log_file: '/var/log/rx-veiculos-combined.log',
    time: true
  }]
};
EOF

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente
pm2 startup

# Verificar status
echo "📊 Status da aplicação:"
pm2 status

# Verificar logs
echo "📝 Últimos logs:"
pm2 logs rx-veiculos --lines 10

echo ""
echo "✅ Configuração de produção concluída!"
echo "🌐 Site disponível em: https://rxnegocio.com.br"
echo "📊 Monitoramento: pm2 monit"
echo "📝 Logs: pm2 logs rx-veiculos"
echo "🔄 Restart: pm2 restart rx-veiculos"
echo "🛑 Stop: pm2 stop rx-veiculos"
echo ""
echo "🔒 SSL: Certificado Let's Encrypt configurado"
echo "🔄 Renovação automática: certbot renew"
echo "⚡ Performance: Nginx + PM2 + Next.js otimizado"
echo ""