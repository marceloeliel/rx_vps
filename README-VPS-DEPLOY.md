# 🚀 Deploy Seguro RX Veículos - VPS Ubuntu

## Configuração Máxima Segurança + Performance

### 1. Preparação Inicial
```bash
# Conectar VPS
ssh root@SEU_IP

# Atualizar sistema
apt update && apt upgrade -y

# Criar usuário
adduser rxveiculos
usermod -aG sudo rxveiculos
```

### 2. SSH Seguro
```bash
# Editar SSH config
nano /etc/ssh/sshd_config

# Configurações:
Port 2022
PermitRootLogin no
PasswordAuthentication no
```

### 3. Firewall
```bash
ufw allow 2022/tcp
ufw allow 80/tcp  
ufw allow 443/tcp
ufw enable
```

### 4. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
npm install -g pnpm pm2
```

### 5. Deploy App
```bash
git clone https://github.com/SEU_REPO/rx-git.git /var/www/rx-veiculos
cd /var/www/rx-veiculos
pnpm install
pnpm build
pm2 start ecosystem.config.js
```

### 6. Nginx + SSL
```bash
apt install -y nginx certbot python3-certbot-nginx
# Configurar nginx
# Obter SSL: certbot --nginx -d seudominio.com
```

✅ **Resultado:** VPS 100% segura e otimizada! 