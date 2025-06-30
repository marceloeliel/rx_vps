# 🚀 DEPLOY COMPLETO RX VEÍCULOS - VPS UBUNTU

## 🛡️ **MÁXIMA SEGURANÇA + ALTA PERFORMANCE**

---

## **📋 CHECKLIST RÁPIDO**

### **1. Preparação da VPS (como root)**
```bash
# Conectar VPS
ssh root@SEU_IP_VPS

# Atualizar sistema
apt update && apt upgrade -y

# Criar usuário seguro
adduser rxveiculos
usermod -aG sudo rxveiculos
```

### **2. SSH Seguro**
```bash
# Configurar SSH
nano /etc/ssh/sshd_config

# Adicionar:
Port 2022
PermitRootLogin no
PasswordAuthentication no
AllowUsers rxveiculos

# Configurar chave SSH
mkdir -p /home/rxveiculos/.ssh
echo "SUA_CHAVE_SSH_PUBLICA" > /home/rxveiculos/.ssh/authorized_keys
chmod 600 /home/rxveiculos/.ssh/authorized_keys
chown -R rxveiculos:rxveiculos /home/rxveiculos/.ssh

systemctl restart sshd
```

### **3. Firewall + Segurança**
```bash
# UFW Firewall
ufw allow 2022/tcp
ufw allow 80/tcp  
ufw allow 443/tcp
ufw enable

# Fail2Ban
apt install -y fail2ban
systemctl enable fail2ban
```

### **4. Node.js + PM2**
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# PNPM + PM2
npm install -g pnpm pm2
```

### **5. Nginx**
```bash
apt install -y nginx

# Configuração básica no arquivo nginx-config.conf
# (substituir seudominio.com pelo seu domínio real)
```

---

## **🔧 DEPLOY DA APLICAÇÃO (como rxveiculos)**

### **1. Mudar para usuário seguro**
```bash
su - rxveiculos
```

### **2. Preparar aplicação**
```bash
# Criar diretório
sudo mkdir -p /var/www/rx-veiculos
sudo chown rxveiculos:rxveiculos /var/www/rx-veiculos

# Clonar repositório
git clone https://github.com/SEU_USUARIO/rx-git.git /var/www/rx-veiculos
cd /var/www/rx-veiculos

# Configurar .env.production
nano .env.production
# (adicionar variáveis Supabase, ASAAS, etc.)
```

### **3. Build e Deploy**
```bash
# Instalar dependências
pnpm install --frozen-lockfile

# Build de produção
pnpm run build

# Copiar configuração PM2
# (usar ecosystem.config.js fornecido)

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## **⚡ NGINX + SSL**

### **1. Configurar Nginx**
```bash
# Copiar configuração (nginx-config.conf)
sudo cp nginx-config.conf /etc/nginx/sites-available/rx-veiculos

# Substituir "seudominio.com" pelo seu domínio
sudo sed -i 's/seudominio.com/SEUDOMINIO.com/g' /etc/nginx/sites-available/rx-veiculos

# Ativar site
sudo ln -sf /etc/nginx/sites-available/rx-veiculos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

### **2. SSL Gratuito**
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d SEUDOMINIO.com -d www.SEUDOMINIO.com
```

---

## **🤖 AUTOMAÇÃO (Scripts)**

### **Criar scripts úteis:**
```bash
# Deploy automático
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/rx-veiculos
git pull origin main
pnpm install --frozen-lockfile
pnpm run build
pm2 restart rx-veiculos
echo "✅ Deploy concluído!"
EOF

# Monitor
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
echo "=== MONITOR RX VEÍCULOS ==="
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "RAM: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
pm2 status
EOF

# Backup
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C /var/www rx-veiculos
echo "Backup: backup_$DATE.tar.gz"
EOF

# Dar permissões
chmod +x ~/deploy.sh ~/monitor.sh ~/backup.sh
```

### **Cron Jobs (automação)**
```bash
# Editar crontab
crontab -e

# Adicionar:
0 2 * * * /home/rxveiculos/backup.sh
0 3 * * 1 certbot renew --quiet
```

---

## **🔒 CHECKLIST DE SEGURANÇA FINAL**

- ✅ **SSH porta 2022** (não padrão)
- ✅ **Root login desabilitado**
- ✅ **Autenticação por chave SSH**
- ✅ **Firewall UFW ativo**
- ✅ **Fail2Ban instalado**
- ✅ **SSL/TLS configurado**
- ✅ **Headers de segurança**
- ✅ **Rate limiting APIs**
- ✅ **Arquivos sensíveis protegidos**

---

## **⚡ OTIMIZAÇÕES DE PERFORMANCE**

- ✅ **Nginx reverse proxy**
- ✅ **Gzip compression**
- ✅ **Cache arquivos estáticos**
- ✅ **PM2 cluster mode**
- ✅ **Next.js otimizado**

---

## **📞 COMANDOS ÚTEIS**

```bash
# Status
pm2 status                    # App
sudo systemctl status nginx   # Nginx
sudo ufw status              # Firewall

# Logs
pm2 logs rx-veiculos         # App logs
sudo tail -f /var/log/nginx/rx-veiculos-error.log

# Manutenção
./deploy.sh                  # Deploy
./monitor.sh                 # Monitor
./backup.sh                  # Backup manual
```

---

## **🎯 RESULTADO FINAL**

✅ **VPS 100% SEGURA**
✅ **PERFORMANCE OTIMIZADA**  
✅ **SSL GRATUITO**
✅ **DEPLOY AUTOMATIZADO**
✅ **MONITORAMENTO ATIVO**
✅ **BACKUPS AUTOMÁTICOS**

**Seu RX Veículos está ONLINE e PROTEGIDO! 🚀**

---

**📝 LEMBRE-SE:**
1. Substitua `SEUDOMINIO.com` pelo seu domínio real
2. Configure as variáveis de ambiente (.env.production)
3. Teste todas as funcionalidades após deploy
4. Mantenha sistema sempre atualizado

**🔐 Sua aplicação está agora rodando com segurança militar!** 