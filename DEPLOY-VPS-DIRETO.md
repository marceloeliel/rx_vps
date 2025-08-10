# 🚀 **Deploy Direto na VPS - Sem Portainer**

## **📋 Visão Geral**

Este guia mostra como fazer deploy da aplicação **RX Veículos** diretamente na VPS usando:
- ✅ **Node.js + pnpm** (build otimizado)
- ✅ **Systemd** (gerenciamento de processo)
- ✅ **Nginx** (proxy reverso)
- ✅ **Let's Encrypt** (SSL gratuito)
- ✅ **Sem Docker/Portainer** (deploy nativo)

## **🛠️ Pré-requisitos**

- **VPS Ubuntu 20.04+** ou **Debian 11+**
- **Acesso root** (sudo)
- **Domínio configurado** apontando para o IP da VPS
- **Portas abertas**: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## **🚀 Deploy Automático**

### **1. Fazer Upload do Script**

```bash
# Na sua VPS, baixe o script
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/deploy-vps-direto.sh

# Ou clone o repositório
git clone https://github.com/marceloeliel/rx-git.git
cd rx-git
```

### **2. Executar o Script**

```bash
# Dar permissão de execução
chmod +x deploy-vps-direto.sh

# Executar como root
sudo ./deploy-vps-direto.sh
```

### **3. Configurar Variáveis de Ambiente**

```bash
# Editar arquivo de configuração
sudo nano /opt/rx-veiculos/.env.production
```

**Configure estas variáveis obrigatórias:**

```env
# URLs da aplicação (ALTERE PARA SEU DOMÍNIO)
NEXTAUTH_URL=https://seu-dominio.com
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
WEBSITE_URL=https://seu-dominio.com

# NextAuth Secret (GERE UM SECRET SEGURO)
NEXTAUTH_SECRET=seu_secret_muito_seguro_aqui

# Supabase (CONFIGURE SUAS CREDENCIAIS)
NEXT_PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# FIPE API
NEXT_PUBLIC_FIPE_API_TOKEN=seu_token_fipe
```

### **4. Configurar Domínio no Nginx**

```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/rx-veiculos

# Substituir 'seu-dominio.com' pelo seu domínio real
sudo sed -i 's/seu-dominio.com/seudominio.com/g' /etc/nginx/sites-available/rx-veiculos

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### **5. Configurar SSL com Let's Encrypt**

```bash
# Instalar certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

### **6. Iniciar a Aplicação**

```bash
# Iniciar serviço
sudo systemctl start rx-veiculos

# Verificar status
sudo systemctl status rx-veiculos

# Ver logs em tempo real
sudo journalctl -u rx-veiculos -f
```

## **📊 Comandos de Gerenciamento**

### **Controle do Serviço**

```bash
# Iniciar
sudo systemctl start rx-veiculos

# Parar
sudo systemctl stop rx-veiculos

# Reiniciar
sudo systemctl restart rx-veiculos

# Status
sudo systemctl status rx-veiculos

# Habilitar inicialização automática
sudo systemctl enable rx-veiculos
```

### **Logs e Monitoramento**

```bash
# Ver logs em tempo real
sudo journalctl -u rx-veiculos -f

# Ver últimas 100 linhas
sudo journalctl -u rx-veiculos -n 100

# Ver logs do Nginx
sudo tail -f /var/log/nginx/rx-veiculos.access.log
sudo tail -f /var/log/nginx/rx-veiculos.error.log
```

### **Atualização da Aplicação**

```bash
# Script de atualização rápida
cd /opt/rx-veiculos
sudo -u rxapp git pull origin main
sudo -u rxapp pnpm install
sudo -u rxapp pnpm build
sudo systemctl restart rx-veiculos
```

## **🔧 Deploy Manual (Passo a Passo)**

Se preferir fazer manualmente:

### **1. Instalar Dependências**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm e PM2
sudo npm install -g pnpm pm2
```

### **2. Criar Usuário da Aplicação**

```bash
# Criar usuário
sudo useradd -r -s /bin/bash -d /opt/rx-veiculos rxapp

# Criar diretório
sudo mkdir -p /opt/rx-veiculos
sudo chown rxapp:rxapp /opt/rx-veiculos
```

### **3. Clonar e Configurar Aplicação**

```bash
# Clonar repositório
sudo -u rxapp git clone https://github.com/marceloeliel/rx-git.git /opt/rx-veiculos

# Instalar dependências
cd /opt/rx-veiculos
sudo -u rxapp pnpm install

# Build
sudo -u rxapp pnpm build
```

### **4. Configurar Variáveis de Ambiente**

```bash
# Criar arquivo .env.production
sudo -u rxapp cp .env.example .env.production
sudo -u rxapp nano .env.production
```

### **5. Criar Serviço Systemd**

```bash
sudo nano /etc/systemd/system/rx-veiculos.service
```

```ini
[Unit]
Description=RX Veículos - Next.js Application
After=network.target

[Service]
Type=simple
User=rxapp
WorkingDirectory=/opt/rx-veiculos
EnvironmentFile=/opt/rx-veiculos/.env.production
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=rx-veiculos

[Install]
WantedBy=multi-user.target
```

### **6. Configurar Nginx**

```bash
sudo nano /etc/nginx/sites-available/rx-veiculos
```

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    
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
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/rx-veiculos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## **🔒 Segurança**

### **Firewall**

```bash
# Configurar UFW
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### **Atualizações Automáticas**

```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## **📈 Monitoramento**

### **Verificar Performance**

```bash
# CPU e Memória
top
htop

# Espaço em disco
df -h

# Processos da aplicação
ps aux | grep node
```

### **Backup Automático**

```bash
# Criar script de backup
sudo nano /opt/backup-rx-veiculos.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/rx-veiculos_$DATE.tar.gz /opt/rx-veiculos

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "rx-veiculos_*.tar.gz" -mtime +7 -delete
```

```bash
# Agendar no crontab
sudo crontab -e

# Adicionar linha para backup diário às 2h
0 2 * * * /opt/backup-rx-veiculos.sh
```

## **🚨 Troubleshooting**

### **Problemas Comuns**

1. **Aplicação não inicia:**
   ```bash
   sudo journalctl -u rx-veiculos -n 50
   ```

2. **Erro 502 Bad Gateway:**
   ```bash
   sudo systemctl status rx-veiculos
   sudo netstat -tlnp | grep 3000
   ```

3. **SSL não funciona:**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   ```

4. **Performance baixa:**
   ```bash
   # Verificar recursos
free -h
df -h
top
   ```

## **✅ Vantagens do Deploy Direto**

- **🚀 Performance**: Sem overhead do Docker
- **💾 Menor uso de recursos**: Menos RAM e CPU
- **🔧 Controle total**: Acesso direto ao sistema
- **📊 Logs nativos**: Integração com systemd
- **🔄 Atualizações simples**: Git pull + restart
- **🛡️ Segurança**: Isolamento por usuário

## **📞 Suporte**

Se encontrar problemas:
1. Verifique os logs: `sudo journalctl -u rx-veiculos -f`
2. Teste a configuração: `sudo nginx -t`
3. Verifique o status: `sudo systemctl status rx-veiculos`
4. Consulte a documentação do Next.js

**🎉 Sua aplicação estará rodando em: `https://seudominio.com`**