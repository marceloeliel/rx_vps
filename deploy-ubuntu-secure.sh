#!/bin/bash

# 🚀 Script de Deploy Seguro para VPS Ubuntu - RX Veículos
# Execução: sudo bash deploy-ubuntu-secure.sh

set -e

echo "🔒 Iniciando configuração segura da VPS Ubuntu..."

# ========================================
# 1. ATUALIZAÇÃO DO SISTEMA
# ========================================
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y
apt autoremove -y

# ========================================
# 2. USUÁRIO NÃO-ROOT COM SUDO
# ========================================
echo "👤 Configurando usuário seguro..."
read -p "Digite o nome do usuário (ex: rxveiculos): " USERNAME
if ! id "$USERNAME" &>/dev/null; then
    adduser --disabled-password --gecos "" $USERNAME
    usermod -aG sudo $USERNAME
    echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$USERNAME
fi

# ========================================
# 3. CONFIGURAÇÃO SSH SEGURA
# ========================================
echo "🔐 Configurando SSH seguro..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

cat > /etc/ssh/sshd_config << EOF
# Configuração SSH Segura - RX Veículos
Port 2022
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers $USERNAME
DenyUsers root
EOF

# Configurar chaves SSH
mkdir -p /home/$USERNAME/.ssh
chmod 700 /home/$USERNAME/.ssh
chown $USERNAME:$USERNAME /home/$USERNAME/.ssh

echo "📋 Cole sua chave SSH pública aqui:"
read -p "Chave SSH: " SSH_KEY
echo "$SSH_KEY" > /home/$USERNAME/.ssh/authorized_keys
chmod 600 /home/$USERNAME/.ssh/authorized_keys
chown $USERNAME:$USERNAME /home/$USERNAME/.ssh/authorized_keys

systemctl restart sshd

# ========================================
# 4. FIREWALL UFW
# ========================================
echo "🔥 Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 2022/tcp  # SSH na porta customizada
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# ========================================
# 5. FAIL2BAN (Proteção contra ataques)
# ========================================
echo "🛡️ Instalando Fail2Ban..."
apt install -y fail2ban

cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

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

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

# ========================================
# 6. INSTALAÇÃO NODE.JS (via NodeSource)
# ========================================
echo "📦 Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Instalar pnpm globalmente
npm install -g pnpm

# ========================================
# 7. NGINX (Reverse Proxy + Static Files)
# ========================================
echo "⚡ Instalando e configurando Nginx..."
apt install -y nginx

# Configuração Nginx otimizada
cat > /etc/nginx/nginx.conf << EOF
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    types_hash_max_size 2048;
    server_tokens off;
    
    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Include vhosts
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# ========================================
# 8. PM2 (Process Manager)
# ========================================
echo "🔄 Instalando PM2..."
npm install -g pm2

# ========================================
# 9. CERTBOT (SSL grátis)
# ========================================
echo "🔒 Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

# ========================================
# 10. CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS
# ========================================
echo "🛡️ Aplicando configurações de segurança adicionais..."

# Desabilitar serviços desnecessários
systemctl disable snapd
systemctl stop snapd

# Configurar iptables adicional
apt install -y iptables-persistent

# Proteção contra DDoS básica
iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# Salvar regras
iptables-save > /etc/iptables/rules.v4

# ========================================
# 11. MONITORAMENTO BÁSICO
# ========================================
echo "📊 Configurando monitoramento..."
apt install -y htop iotop nethogs

# Script de monitoramento simples
cat > /home/$USERNAME/monitor.sh << 'EOF'
#!/bin/bash
echo "=== MONITOR RX VEÍCULOS ==="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "DISK: $(df -h / | awk 'NR==2{print $5}')"
echo "CONEXÕES: $(netstat -an | grep :80 | wc -l) HTTP / $(netstat -an | grep :443 | wc -l) HTTPS"
echo "PM2 Status:"
pm2 status
EOF

chmod +x /home/$USERNAME/monitor.sh
chown $USERNAME:$USERNAME /home/$USERNAME/monitor.sh

# ========================================
# 12. CLEANUP E FINALIZACAO
# ========================================
echo "🧹 Limpeza final..."
apt autoremove -y
apt autoclean

echo ""
echo "✅ ==============================================="
echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "==============================================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Faça login via SSH na porta 2022:"
echo "   ssh -p 2022 $USERNAME@SEU_IP"
echo ""
echo "2. Execute o script de deploy da aplicação:"
echo "   bash deploy-app.sh"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- SSH agora roda na porta 2022"
echo "- Login root foi desabilitado"
echo "- Firewall está ativo"
echo "- Fail2Ban está protegendo contra ataques"
echo ""
echo "🔒 Sua VPS está agora MÁXIMO SEGURA!"
echo "===============================================" 