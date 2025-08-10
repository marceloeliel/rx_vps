#!/bin/bash

# Script de Instalação Automática RX Veículos - VPS
# Execute este script na VPS: bash install-vps-automatico.sh

set -e

echo "🚀 Iniciando instalação automática do RX Veículos..."
echo "📅 $(date)"
echo "🖥️  Sistema: $(uname -a)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    error "Este script deve ser executado como root. Use: sudo bash install-vps-automatico.sh"
fi

log "Atualizando sistema..."
apt update && apt upgrade -y

log "Instalando dependências básicas..."
apt install -y curl wget git nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Docker
log "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    log "Docker instalado com sucesso!"
else
    info "Docker já está instalado."
fi

# Instalar Docker Compose
log "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log "Docker Compose instalado com sucesso!"
else
    info "Docker Compose já está instalado."
fi

# Instalar Node.js
log "Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log "Node.js instalado com sucesso!"
else
    info "Node.js já está instalado."
fi

# Instalar PM2
log "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log "PM2 instalado com sucesso!"
else
    info "PM2 já está instalado."
fi

# Criar diretório da aplicação
log "Configurando diretório da aplicação..."
cd /opt

# Remover instalação anterior se existir
if [ -d "rx-git" ]; then
    warning "Removendo instalação anterior..."
    rm -rf rx-git
fi

# Clonar repositório
log "Clonando repositório..."
git clone https://github.com/marceloeliel/rx-git.git
cd rx-git

# Criar arquivo .env com as credenciais
log "Configurando variáveis de ambiente..."
cat > .env << 'EOF'
NODE_ENV=production
NEXTAUTH_URL=https://rxnegocio.com.br
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_super_segura_2024

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ecdmpndeunbzhaihabvi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzExMDcsImV4cCI6MjA2MTUwNzEwN30.R_9A1kphbMK37pBsEuzm--ujaXv52i80oKGP46VygLM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZG1wbmRldW5iemhhaWhhYnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMTEwNywiZXhwIjoyMDYxNTA3MTA3fQ.2CdNPp5I8RVsIqU1IJH3T_OHZDnveO7ZOZt4bn9QVn0

# Database
DATABASE_URL=postgresql://postgres.ecdmpndeunbzhaihabvi:T0nFRFXDZRaETRLV@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# FIPE API
NEXT_PUBLIC_FIPE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYWZmMzBjMS1lMjhlLTRjNjctYTkwYS0zNGVlNzUyNmJlYTAiLCJlbWFpbCI6InNlZ3RyYWtlckBnbWFpbC5jb20iLCJpYXQiOjE3Mzk1NDYwMTJ

# Production URLs
NEXT_PUBLIC_APP_URL=https://rxnegocio.com.br
WEBSITE_URL=https://rxnegocio.com.br

# PostgreSQL Details
POSTGRES_HOST=aws-0-sa-east-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=postgres.ecdmpndeunbzhaihabvi
POSTGRES_PASSWORD=T0nFRFXDZRaETRLV
POSTGRES_POOL_MODE=transaction

# Optional
WEBHOOK_URL=https://hooks.slack.com/services/...
ADMIN_EMAIL=admin@rxnegocio.com.br
EOF

log "Instalando dependências do projeto..."
npm install --production

log "Construindo aplicação..."
npm run build

# Configurar PM2
log "Configurando PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rx-veiculos',
    script: 'npm',
    args: 'start',
    cwd: '/opt/rx-git',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/rx-veiculos-error.log',
    out_file: '/var/log/rx-veiculos-out.log',
    log_file: '/var/log/rx-veiculos-combined.log'
  }]
};
EOF

# Parar PM2 se estiver rodando
pm2 delete rx-veiculos 2>/dev/null || true

# Iniciar aplicação com PM2
log "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Instalar e configurar Nginx
log "Instalando e configurando Nginx..."
apt install -y nginx

# Criar configuração do Nginx
cat > /etc/nginx/sites-available/rxnegocio.com.br << 'EOF'
server {
    listen 80;
    server_name rxnegocio.com.br www.rxnegocio.com.br 31.97.92.120;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rxnegocio.com.br www.rxnegocio.com.br;
    
    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Images
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000";
    }
}

# HTTP server for IP access
server {
    listen 80;
    server_name 31.97.92.120;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/rxnegocio.com.br /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Instalar Certbot para SSL
log "Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

# Configurar firewall
log "Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Criar script de monitoramento
log "Criando script de monitoramento..."
cat > /opt/rx-git/monitor.sh << 'EOF'
#!/bin/bash

# Script de monitoramento RX Veículos
echo "=== Status RX Veículos ==="
echo "Data: $(date)"
echo ""

echo "🐳 Docker Status:"
docker --version
echo ""

echo "📦 PM2 Status:"
pm2 status
echo ""

echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l
echo ""

echo "💾 Uso de Memória:"
free -h
echo ""

echo "💿 Uso de Disco:"
df -h /
echo ""

echo "🔗 Teste de Conectividade:"
curl -I http://localhost:3000 2>/dev/null | head -1
echo ""

echo "📊 Logs Recentes (últimas 10 linhas):"
pm2 logs rx-veiculos --lines 10 --nostream
EOF

chmod +x /opt/rx-git/monitor.sh

# Criar script de atualização
log "Criando script de atualização..."
cat > /opt/rx-git/update.sh << 'EOF'
#!/bin/bash

echo "🔄 Atualizando RX Veículos..."
cd /opt/rx-git

# Backup do .env
cp .env .env.backup

# Atualizar código
git pull

# Restaurar .env
mv .env.backup .env

# Instalar dependências
npm install --production

# Build
npm run build

# Reiniciar PM2
pm2 restart rx-veiculos

echo "✅ Atualização concluída!"
EOF

chmod +x /opt/rx-git/update.sh

log "Configurando logs..."
mkdir -p /var/log
touch /var/log/rx-veiculos-error.log
touch /var/log/rx-veiculos-out.log
touch /var/log/rx-veiculos-combined.log

# Aguardar aplicação inicializar
log "Aguardando aplicação inicializar..."
sleep 10

# Verificar status
log "Verificando status da instalação..."
echo ""
echo "🔍 Status dos Serviços:"
echo "Docker: $(systemctl is-active docker)"
echo "Nginx: $(systemctl is-active nginx)"
echo "PM2: $(pm2 list | grep rx-veiculos | awk '{print $18}' || echo 'stopped')"
echo ""

# Teste de conectividade
echo "🌐 Testando conectividade:"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação respondendo em http://localhost:3000"
else
    echo "❌ Aplicação não está respondendo"
fi

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "📋 Informações importantes:"
echo "• Aplicação: http://31.97.92.120:3000"
echo "• Domínio: https://rxnegocio.com.br (após configurar SSL)"
echo "• Logs: pm2 logs rx-veiculos"
echo "• Status: pm2 status"
echo "• Monitor: /opt/rx-git/monitor.sh"
echo "• Atualizar: /opt/rx-git/update.sh"
echo ""
echo "🔐 Para configurar SSL:"
echo "certbot --nginx -d rxnegocio.com.br -d www.rxnegocio.com.br"
echo ""
echo "📊 Para monitorar:"
echo "pm2 monit"
echo ""
log "Instalação automática finalizada com sucesso!"