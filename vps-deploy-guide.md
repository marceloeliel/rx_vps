# 🚀 Guia Completo: Deploy Seguro RX Veículos em VPS Ubuntu

## 🛡️ **Máxima Segurança + Alta Performance**

### **📋 Pré-requisitos:**
- VPS Ubuntu 20.04+ com acesso root
- Domínio apontando para o IP da VPS
- Chave SSH gerada localmente

---

## **1️⃣ CONFIGURAÇÃO INICIAL DA VPS**

### **Conectar via SSH:**
```bash
ssh root@SEU_IP_VPS
```

### **Atualizar sistema:**
```bash
apt update && apt upgrade -y
apt autoremove -y
```

### **Criar usuário não-root:**
```bash
adduser rxveiculos
usermod -aG sudo rxveiculos
echo "rxveiculos ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/rxveiculos
```

---

## **2️⃣ SEGURANÇA MÁXIMA**

### **SSH Seguro:**
```bash
# Backup da configuração atual
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Nova configuração SSH
cat > /etc/ssh/sshd_config << 'EOF'
Port 2022
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers rxveiculos
DenyUsers root
X11Forwarding no
EOF

systemctl restart sshd
```

### **Configurar chave SSH:**
```bash
mkdir -p /home/rxveiculos/.ssh
chmod 700 /home/rxveiculos/.ssh

# Cole sua chave pública aqui
echo "ssh-rsa AAAAB3... seu_email@exemplo.com" > /home/rxveiculos/.ssh/authorized_keys

chmod 600 /home/rxveiculos/.ssh/authorized_keys
chown -R rxveiculos:rxveiculos /home/rxveiculos/.ssh
```

### **Firewall UFW:**
```bash
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 2022/tcp  # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
```

### **Fail2Ban (Anti-ataques):**
```bash
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2022
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1800

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

---

## **3️⃣ INSTALAÇÃO NODE.JS + PNPM**

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# PNPM
npm install -g pnpm pm2
```

---

## **4️⃣ NGINX (Reverse Proxy)**

### **Instalar Nginx:**
```bash
apt install -y nginx
```

### **Configuração otimizada:**
```bash
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    types_hash_max_size 2048;
    server_tokens off;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
```

---

## **5️⃣ DEPLOY DA APLICAÇÃO**

### **Como usuário rxveiculos:**
```bash
# Mudar para usuário criado
su - rxveiculos

# Criar diretório da app
sudo mkdir -p /var/www/rx-veiculos
sudo chown rxveiculos:rxveiculos /var/www/rx-veiculos

# Clonar repositório
git clone https://github.com/SEU_USUARIO/rx-git.git /var/www/rx-veiculos
cd /var/www/rx-veiculos

# Instalar dependências
pnpm install --frozen-lockfile

# Build de produção
pnpm run build
```

### **Configurar PM2:**
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rx-veiculos',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/rx-veiculos',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=1024',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    autorestart: true
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## **6️⃣ CONFIGURAR NGINX PARA DOMÍNIO**

### **Criar configuração do site:**
```bash
sudo tee /etc/nginx/sites-available/rx-veiculos << 'EOF'
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;
    
    # SSL será configurado pelo Certbot
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache para arquivos estáticos
    location /_next/static/ {
        alias /var/www/rx-veiculos/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /images/ {
        alias /var/www/rx-veiculos/public/images/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # API com rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Aplicação principal
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Bloquear arquivos sensíveis
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(\.env|\.git|node_modules|\.next/cache) {
        deny all;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/rx-veiculos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t
sudo systemctl reload nginx
```

---

## **7️⃣ SSL GRÁTIS (Let's Encrypt)**

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado (substitua SEU_DOMINIO.com)
sudo certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com --non-interactive --agree-tos --email admin@SEU_DOMINIO.com
```

---

## **8️⃣ SCRIPTS DE AUTOMAÇÃO**

### **Script de Deploy Automático:**
```bash
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando deploy..."
cd /var/www/rx-veiculos
git pull origin main
pnpm install --frozen-lockfile
pnpm run build
pm2 restart rx-veiculos
echo "✅ Deploy concluído!"
EOF

chmod +x ~/deploy.sh
```

### **Script de Monitoramento:**
```bash
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
echo "=== MONITOR RX VEÍCULOS ==="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "DISK: $(df -h / | awk 'NR==2{print $5}')"
echo "CONEXÕES: $(netstat -an | grep :80 | wc -l) HTTP / $(netstat -an | grep :443 | wc -l) HTTPS"
echo "PM2 Status:"
pm2 status
EOF

chmod +x ~/monitor.sh
```

### **Backup Automático (Cron):**
```bash
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/rxveiculos/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /var/www rx-veiculos
ls -t $BACKUP_DIR/app_backup_*.tar.gz | tail -n +8 | xargs rm -f
echo "Backup criado: app_backup_$DATE.tar.gz"
EOF

chmod +x ~/backup.sh

# Adicionar ao crontab (backup diário às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/rxveiculos/backup.sh") | crontab -
```

---

## **9️⃣ COMANDOS ÚTEIS**

```bash
# Status dos serviços
pm2 status                    # Status da aplicação
sudo systemctl status nginx   # Status do Nginx
sudo ufw status               # Status do firewall
sudo fail2ban-client status   # Status do Fail2Ban

# Logs
pm2 logs rx-veiculos          # Logs da aplicação
sudo tail -f /var/log/nginx/access.log  # Logs do Nginx
sudo tail -f /var/log/auth.log          # Logs de autenticação

# Deploy e manutenção
./deploy.sh                   # Deploy automático
./monitor.sh                  # Monitor do sistema
./backup.sh                   # Backup manual

# PM2
pm2 restart rx-veiculos       # Reiniciar app
pm2 reload rx-veiculos        # Reload sem downtime
pm2 stop rx-veiculos          # Parar app
pm2 delete rx-veiculos        # Remover app
```

---

## **🔒 CHECKLIST DE SEGURANÇA**

- ✅ **SSH na porta 2022** (não padrão)
- ✅ **Login root desabilitado**
- ✅ **Autenticação por chave SSH apenas**
- ✅ **Firewall UFW ativo**
- ✅ **Fail2Ban contra ataques**
- ✅ **SSL/TLS certificado**
- ✅ **Headers de segurança**
- ✅ **Rate limiting nas APIs**
- ✅ **Arquivos sensíveis bloqueados**
- ✅ **Backups automáticos**

---

## **⚡ OTIMIZAÇÕES DE PERFORMANCE**

- ✅ **Nginx reverse proxy**
- ✅ **Gzip compression**
- ✅ **Cache de arquivos estáticos**
- ✅ **PM2 cluster mode**
- ✅ **Node.js otimizado**
- ✅ **Rate limiting**
- ✅ **Keep-alive connections**

---

## **🚀 PRÓXIMOS PASSOS**

1. **Substitua `SEU_DOMINIO.com`** pela sua URL real
2. **Configure suas variáveis de ambiente** (Supabase, ASAAS, etc.)
3. **Teste thoroughly** todas as funcionalidades
4. **Configure monitoramento** adicional se necessário
5. **Documente** credenciais e procedimentos

---

## **📞 SUPORTE**

Se algo der errado:
1. Verifique os logs: `pm2 logs rx-veiculos`
2. Teste Nginx: `sudo nginx -t`
3. Verifique portas: `netstat -tlnp`
4. Status dos serviços: `sudo systemctl status nginx`

**Sua VPS está agora MÁXIMO SEGURA e OTIMIZADA! 🎉** 