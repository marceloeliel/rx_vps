# 🚀 Deploy Direto na VPS - RX Veículos

Este guia completo mostra como fazer o deploy da aplicação RX Veículos diretamente na VPS, sem usar Docker ou Portainer.

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Deploy Automático](#-deploy-automático)
- [Deploy Manual](#-deploy-manual)
- [Configuração](#-configuração)
- [Gerenciamento](#-gerenciamento)
- [Monitoramento](#-monitoramento)
- [Atualização](#-atualização)
- [Troubleshooting](#-troubleshooting)
- [Segurança](#-segurança)

## 🔧 Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04+ ou Debian 11+
- Acesso root ou sudo
- Mínimo 2GB RAM, 20GB disco

### Domínio e DNS
- Domínio configurado apontando para o IP da VPS
- Portas 80 e 443 abertas no firewall

## 🚀 Deploy Automático

### 1. Download e Execução do Script

```bash
# Fazer download do repositório
git clone https://github.com/marceloeliel/rx-git.git
cd rx-git

# Dar permissão de execução
chmod +x deploy-vps-direto.sh

# Executar o deploy
sudo ./deploy-vps-direto.sh
```

### 2. Configurar Variáveis de Ambiente

Após o deploy, edite o arquivo de configuração:

```bash
sudo nano /opt/rx-veiculos/.env.production
```

**Variáveis obrigatórias:**
```env
# Configuração do servidor
PORT=3000
NODE_ENV=production

# Base de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/rx_veiculos"

# JWT
JWT_SECRET="sua_chave_secreta_muito_forte_aqui"

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Domínio
APP_URL=https://seudominio.com
```

### 3. Configurar SSL

```bash
# Configurar certificado SSL
sudo certbot --nginx -d seudominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

## 🔨 Deploy Manual

### 1. Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2
npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Instalar Git
sudo apt install -y git
```

### 2. Criar Usuário da Aplicação

```bash
# Criar usuário
sudo useradd -r -s /bin/bash -d /opt/rx-veiculos rxapp

# Criar diretório
sudo mkdir -p /opt/rx-veiculos
sudo chown rxapp:rxapp /opt/rx-veiculos
```

### 3. Clonar e Configurar Aplicação

```bash
# Mudar para usuário da aplicação
sudo -u rxapp bash

# Clonar repositório
cd /opt/rx-veiculos
git clone https://github.com/marceloeliel/rx-git.git .

# Instalar dependências
pnpm install

# Fazer build
pnpm build

# Copiar arquivo de configuração
cp .env.example .env.production

# Sair do usuário rxapp
exit
```

### 4. Configurar Serviço Systemd

```bash
sudo tee /etc/systemd/system/rx-veiculos.service > /dev/null <<EOF
[Unit]
Description=RX Veículos Application
After=network.target

[Service]
Type=simple
User=rxapp
WorkingDirectory=/opt/rx-veiculos
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=rx-veiculos

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable rx-veiculos
sudo systemctl start rx-veiculos
```

### 5. Configurar Nginx

```bash
sudo tee /etc/nginx/sites-available/rx-veiculos > /dev/null <<EOF
server {
    listen 80;
    server_name seudominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;
    
    # SSL configuration will be added by Certbot
    
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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Habilitar site
sudo ln -sf /etc/nginx/sites-available/rx-veiculos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## ⚙️ Configuração

### Variáveis de Ambiente

Edite `/opt/rx-veiculos/.env.production`:

```env
# === CONFIGURAÇÃO OBRIGATÓRIA ===
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://usuario:senha@localhost:5432/rx_veiculos"
JWT_SECRET="chave_secreta_muito_forte_com_pelo_menos_32_caracteres"
APP_URL=https://seudominio.com

# === CONFIGURAÇÃO OPCIONAL ===
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM="RX Veículos <noreply@seudominio.com>"

# Upload de arquivos
UPLOAD_MAX_SIZE=10485760  # 10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# Rate limiting
RATE_LIMIT_WINDOW=900000  # 15 minutos
RATE_LIMIT_MAX=100        # 100 requests por janela

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/rx-veiculos.log

# Cache
REDIS_URL=redis://localhost:6379

# Monitoramento
HEALTH_CHECK_INTERVAL=30000  # 30 segundos
```

### Banco de Dados PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configurar banco
sudo -u postgres psql
```

```sql
-- Criar usuário e banco
CREATE USER rxapp WITH PASSWORD 'senha_forte_aqui';
CREATE DATABASE rx_veiculos OWNER rxapp;
GRANT ALL PRIVILEGES ON DATABASE rx_veiculos TO rxapp;
\q
```

## 🎛️ Gerenciamento

### Comandos do Serviço

```bash
# Status
sudo systemctl status rx-veiculos

# Iniciar
sudo systemctl start rx-veiculos

# Parar
sudo systemctl stop rx-veiculos

# Reiniciar
sudo systemctl restart rx-veiculos

# Ver logs
sudo journalctl -u rx-veiculos -f

# Ver logs das últimas 24h
sudo journalctl -u rx-veiculos --since "24 hours ago"
```

### Comandos do Nginx

```bash
# Status
sudo systemctl status nginx

# Testar configuração
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Reiniciar
sudo systemctl restart nginx

# Ver logs de acesso
sudo tail -f /var/log/nginx/access.log

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoramento

### Script de Monitoramento

```bash
# Dar permissão
chmod +x monitor-app.sh

# Verificação única
sudo ./monitor-app.sh check

# Relatório de status
sudo ./monitor-app.sh status

# Monitoramento contínuo
sudo ./monitor-app.sh daemon
```

### Configurar Monitoramento Automático

```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha (verificação a cada 5 minutos)
*/5 * * * * /opt/rx-veiculos/monitor-app.sh check
```

### Métricas Importantes

- **CPU**: < 80% em média
- **Memória**: < 80% do total
- **Disco**: < 85% usado
- **Tempo de resposta**: < 2 segundos
- **Uptime**: > 99.5%

## 🔄 Atualização

### Script de Atualização

```bash
# Dar permissão
chmod +x update-app.sh

# Executar atualização
sudo ./update-app.sh
```

### Atualização Manual

```bash
# Parar serviço
sudo systemctl stop rx-veiculos

# Fazer backup
sudo tar -czf /opt/backups/rx-veiculos_$(date +%Y%m%d_%H%M%S).tar.gz -C /opt rx-veiculos

# Atualizar código
cd /opt/rx-veiculos
sudo -u rxapp git pull origin main
sudo -u rxapp pnpm install
sudo -u rxapp pnpm build

# Reiniciar serviço
sudo systemctl start rx-veiculos
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Aplicação não inicia
```bash
# Verificar logs
sudo journalctl -u rx-veiculos -n 50

# Verificar configuração
sudo -u rxapp cat /opt/rx-veiculos/.env.production

# Testar manualmente
cd /opt/rx-veiculos
sudo -u rxapp NODE_ENV=production node dist/index.js
```

#### Erro 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
curl http://localhost:3000

# Verificar configuração do Nginx
sudo nginx -t

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

#### SSL não funciona
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Testar configuração SSL
ssl-cert-check -c /etc/letsencrypt/live/seudominio.com/fullchain.pem
```

#### Alto uso de memória
```bash
# Ver processos
top -p $(pgrep -f "node.*rx-veiculos")

# Analisar heap
node --inspect dist/index.js

# Reiniciar aplicação
sudo systemctl restart rx-veiculos
```

### Logs Importantes

```bash
# Logs da aplicação
sudo journalctl -u rx-veiculos -f

# Logs do sistema
sudo tail -f /var/log/syslog

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de autenticação
sudo tail -f /var/log/auth.log
```

## 🔒 Segurança

### Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Verificar status
sudo ufw status
```

### Fail2Ban

```bash
# Instalar
sudo apt install -y fail2ban

# Configurar
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

# Reiniciar
sudo systemctl restart fail2ban
```

### Atualizações Automáticas

```bash
# Instalar unattended-upgrades
sudo apt install -y unattended-upgrades

# Configurar
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Backup Automático

```bash
# Criar script de backup
sudo tee /opt/backup-rx-veiculos.sh > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup da aplicação
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /opt rx-veiculos

# Backup do banco (se PostgreSQL)
pg_dump -U rxapp rx_veiculos | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup-rx-veiculos.sh

# Adicionar ao crontab (backup diário às 2h)
sudo crontab -e
# Adicionar: 0 2 * * * /opt/backup-rx-veiculos.sh
```

## 📞 Suporte

### Informações do Sistema

```bash
# Versão do sistema
lsb_release -a

# Recursos do sistema
free -h
df -h
lscpu

# Versões das aplicações
node --version
npm --version
pnpm --version
nginx -v
```

### Contato

- **Repositório**: https://github.com/marceloeliel/rx-git
- **Issues**: https://github.com/marceloeliel/rx-git/issues
- **Documentação**: Este arquivo README

---

## ✅ Checklist de Deploy

- [ ] VPS configurada com Ubuntu/Debian
- [ ] Domínio apontando para IP da VPS
- [ ] Portas 80 e 443 abertas
- [ ] Script de deploy executado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL configurado com Let's Encrypt
- [ ] Aplicação respondendo em HTTPS
- [ ] Monitoramento configurado
- [ ] Backup automático configurado
- [ ] Firewall configurado
- [ ] Logs sendo gerados corretamente

**🎉 Parabéns! Sua aplicação RX Veículos está rodando diretamente na VPS!**