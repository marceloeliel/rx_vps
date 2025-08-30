#!/bin/bash

# Script de otimização de performance para RX Negócio
# Este script aplica configurações otimizadas para resolver problemas de lentidão

echo "🚀 Iniciando otimização de performance..."

# 1. Backup da configuração atual do Nginx
echo "📋 Fazendo backup da configuração atual do Nginx..."
sudo cp /etc/nginx/sites-available/rxnegocio /etc/nginx/sites-available/rxnegocio.backup.$(date +%Y%m%d_%H%M%S)

# 2. Aplicar nova configuração otimizada do Nginx
echo "⚙️ Aplicando configuração otimizada do Nginx..."
sudo cp nginx-rxnegocio-optimized.conf /etc/nginx/sites-available/rxnegocio

# 3. Testar configuração do Nginx
echo "🔍 Testando configuração do Nginx..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração do Nginx. Restaurando backup..."
    sudo cp /etc/nginx/sites-available/rxnegocio.backup.* /etc/nginx/sites-available/rxnegocio
    exit 1
fi

# 4. Recarregar Nginx
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

# 5. Otimizar aplicação Next.js
echo "⚡ Otimizando aplicação Next.js..."

# Parar aplicação
pm2 stop rxnegocio

# Limpar cache do Next.js
rm -rf .next
rm -rf node_modules/.cache

# Rebuild com otimizações
echo "🔨 Rebuilding aplicação com otimizações..."
NODE_ENV=production pnpm build

# 6. Configurar PM2 com otimizações
echo "🔧 Configurando PM2 com otimizações..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rxnegocio',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/var/log/pm2/rxnegocio-error.log',
    out_file: '/var/log/pm2/rxnegocio-out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs'],
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
}
EOF

# 7. Reiniciar aplicação com nova configuração
echo "🚀 Reiniciando aplicação com configurações otimizadas..."
pm2 delete rxnegocio 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

# 8. Configurar logrotate para logs
echo "📝 Configurando rotação de logs..."
sudo tee /etc/logrotate.d/rxnegocio << EOF
/var/log/nginx/rxnegocio_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}

/var/log/pm2/rxnegocio-*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# 9. Otimizar sistema operacional
echo "🔧 Aplicando otimizações do sistema..."

# Configurar limites de arquivo
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Otimizar kernel para aplicações web
sudo tee -a /etc/sysctl.conf << EOF
# Otimizações para aplicações web
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
EOF

sudo sysctl -p

# 10. Verificar status final
echo "✅ Verificando status dos serviços..."
echo "Nginx:"
sudo systemctl status nginx --no-pager -l
echo "\nPM2:"
pm2 status
echo "\nMemória:"
free -h
echo "\nDisco:"
df -h

echo "🎉 Otimização concluída!"
echo "📊 Monitore a performance com: pm2 monit"
echo "📋 Logs do Nginx: tail -f /var/log/nginx/rxnegocio_error.log"
echo "📋 Logs da aplicação: pm2 logs rxnegocio"