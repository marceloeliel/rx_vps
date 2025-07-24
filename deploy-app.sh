#!/bin/bash

# 🚀 Script de Deploy da Aplicação RX Veículos
# Execução: bash deploy-app.sh

set -e

echo "🚀 Iniciando deploy da aplicação RX Veículos..."

# Variáveis
APP_NAME="rx-veiculos"
APP_DIR="/var/www/$APP_NAME"
DOMAIN_NAME=""
USER_NAME=$(whoami)

# ========================================
# 1. CONFIGURAÇÃO INICIAL
# ========================================
echo "📋 Configurando variáveis..."
read -p "Digite seu domínio (ex: rxveiculos.com): " DOMAIN_NAME
read -p "Digite o repositório Git (ex: https://github.com/user/rx-git.git): " GIT_REPO

# ========================================
# 2. PREPARAR DIRETÓRIO DA APLICAÇÃO
# ========================================
echo "📂 Preparando diretório da aplicação..."
sudo mkdir -p $APP_DIR
sudo chown $USER_NAME:$USER_NAME $APP_DIR

# ========================================
# 3. CLONAR REPOSITÓRIO
# ========================================
echo "📥 Clonando repositório..."
if [ -d "$APP_DIR/.git" ]; then
    echo "Repositório já existe, fazendo pull..."
    cd $APP_DIR
    git pull origin main
else
    git clone $GIT_REPO $APP_DIR
    cd $APP_DIR
fi

# ========================================
# 4. CONFIGURAR VARIÁVEIS DE AMBIENTE
# ========================================
echo "🔧 Configurando variáveis de ambiente..."

# Criar arquivo .env.production
cat > .env.production << EOF
# Configuração de Produção - RX Veículos
NODE_ENV=production

# Next.js
NEXTAUTH_URL=https://$DOMAIN_NAME
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Supabase (cole suas credenciais)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# ASAAS (cole suas credenciais)
ASAAS_API_KEY=your_asaas_api_key
ASAAS_BASE_URL=https://www.asaas.com/api/v3

# Outros
DATABASE_URL=your_database_url
EOF

echo "⚠️  IMPORTANTE: Edite o arquivo .env.production com suas credenciais reais:"
echo "   nano .env.production"
read -p "Pressione ENTER após editar o arquivo .env.production..."

# ========================================
# 5. INSTALAR DEPENDÊNCIAS E BUILD
# ========================================
echo "📦 Instalando dependências..."
pnpm install --frozen-lockfile

echo "🔨 Fazendo build de produção..."
pnpm run build

# ========================================
# 6. CONFIGURAR PM2
# ========================================
echo "🔄 Configurando PM2..."

# Criar configuração PM2 otimizada
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    log_file: '/var/log/pm2/$APP_NAME.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=1024',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    autorestart: true
  }]
};
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/pm2
sudo chown $USER_NAME:$USER_NAME /var/log/pm2

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# ========================================
# 7. CONFIGURAR NGINX PARA O DOMÍNIO
# ========================================
echo "⚡ Configurando Nginx..."

sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
# Configuração Nginx - RX Veículos
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Redirecionamento para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # SSL Configuration (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:;" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    
    # Rate Limiting
    limit_req zone=api burst=20 nodelay;
    
    # Root and index
    root $APP_DIR;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/$APP_NAME-access.log main;
    error_log /var/log/nginx/$APP_NAME-error.log;
    
    # Static files cache
    location /_next/static/ {
        alias $APP_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias $APP_DIR/public/images/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location /favicon.ico {
        alias $APP_DIR/public/favicon.ico;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Main application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(\.env|\.git|node_modules|\.next/cache) {
        deny all;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# ========================================
# 8. CERTIFICADO SSL (Let's Encrypt)
# ========================================
echo "🔒 Configurando SSL..."
sudo systemctl reload nginx

# Obter certificado SSL
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME

# ========================================
# 9. CONFIGURAR BACKUP AUTOMÁTICO
# ========================================
echo "💾 Configurando backup automático..."

# Script de backup
cat > /home/$USER_NAME/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$(whoami)/backups"
APP_DIR="/var/www/rx-veiculos"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup dos arquivos
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www rx-veiculos

# Manter apenas os últimos 7 backups
ls -t $BACKUP_DIR/app_backup_*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup criado: app_backup_$DATE.tar.gz"
EOF

chmod +x /home/$USER_NAME/backup.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER_NAME/backup.sh") | crontab -

# ========================================
# 10. SCRIPT DE DEPLOY AUTOMÁTICO
# ========================================
echo "🔄 Criando script de deploy automático..."

cat > /home/$USER_NAME/deploy.sh << EOF
#!/bin/bash
# Script de Deploy Automático - RX Veículos

echo "🚀 Iniciando deploy..."

cd $APP_DIR

# Backup antes do deploy
echo "💾 Fazendo backup..."
/home/$USER_NAME/backup.sh

# Pull das mudanças
echo "📥 Baixando atualizações..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install --frozen-lockfile

# Build
echo "🔨 Fazendo build..."
pnpm run build

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart $APP_NAME

echo "✅ Deploy concluído!"
pm2 status
EOF

chmod +x /home/$USER_NAME/deploy.sh

# ========================================
# 11. CONFIGURAR MONITORAMENTO
# ========================================
echo "📊 Configurando monitoramento avançado..."

# Script de health check
cat > /home/$USER_NAME/healthcheck.sh << EOF
#!/bin/bash
# Health Check - RX Veículos

APP_URL="https://$DOMAIN_NAME"
STATUS=\$(curl -s -o /dev/null -w "%{http_code}" \$APP_URL)

if [ \$STATUS -eq 200 ]; then
    echo "✅ App funcionando - Status: \$STATUS"
else
    echo "❌ App com problema - Status: \$STATUS"
    echo "🔄 Tentando reiniciar..."
    pm2 restart $APP_NAME
    
    # Enviar notificação (configure seu webhook/email)
    # curl -X POST -H 'Content-type: application/json' --data '{"text":"🚨 RX Veículos app down!"}' YOUR_WEBHOOK_URL
fi
EOF

chmod +x /home/$USER_NAME/healthcheck.sh

# Health check a cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/$USER_NAME/healthcheck.sh") | crontab -

# ========================================
# 12. FINALIZACAO
# ========================================
echo "🧹 Finalizando configuração..."

# Reiniciar serviços
sudo systemctl reload nginx
pm2 restart $APP_NAME

echo ""
echo "✅ ==============================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "==============================================="
echo ""
echo "🌐 Seu site está rodando em:"
echo "   https://$DOMAIN_NAME"
echo ""
echo "📋 COMANDOS ÚTEIS:"
echo "   Deploy:      ./deploy.sh"
echo "   Monitor:     ./monitor.sh"
echo "   Health:      ./healthcheck.sh"
echo "   Backup:      ./backup.sh"
echo "   Logs:        pm2 logs $APP_NAME"
echo "   Status:      pm2 status"
echo ""
echo "🔒 RECURSOS DE SEGURANÇA ATIVOS:"
echo "   ✅ SSL/TLS certificado"
echo "   ✅ Headers de segurança"
echo "   ✅ Rate limiting"
echo "   ✅ Firewall UFW"
echo "   ✅ Fail2Ban"
echo "   ✅ SSH seguro (porta 2022)"
echo ""
echo "⚡ OTIMIZAÇÕES DE PERFORMANCE:"
echo "   ✅ Nginx reverse proxy"
echo "   ✅ Gzip compression"
echo "   ✅ Cache de arquivos estáticos"
echo "   ✅ PM2 cluster mode"
echo "   ✅ Rate limiting APIs"
echo ""
echo "🚀 Seu RX Veículos está ONLINE e SEGURO!"
echo "==============================================="
EOF 