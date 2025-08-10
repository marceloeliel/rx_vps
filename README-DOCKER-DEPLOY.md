# 🐳 RX Veículos - Deploy com Docker

## 🚀 Deploy Rápido em Produção

### **Opção 1: Script Automático (Recomendado)**

```bash
# Conectar na VPS via SSH
ssh usuario@seu-servidor

# Baixar e executar script de deploy
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/deploy-docker-quick.sh
chmod +x deploy-docker-quick.sh
./deploy-docker-quick.sh
```

**O script fará automaticamente:**
- ✅ Remove instalação anterior
- ✅ Instala Docker e Docker Compose
- ✅ Configura firewall
- ✅ Instala Portainer (opcional)
- ✅ Clona repositório
- ✅ Cria configuração base
- ✅ Faz deploy da aplicação

---

### **Opção 2: Passo a Passo Manual**

#### **1. Remover Instalação Anterior**
```bash
# Baixar script de limpeza
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/remove-vps-installation.sh
chmod +x remove-vps-installation.sh
./remove-vps-installation.sh
```

#### **2. Instalar Docker**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sessão
exit
# Conectar novamente
```

#### **3. Preparar Aplicação**
```bash
# Criar diretório
sudo mkdir -p /opt/rx-veiculos
sudo chown $USER:$USER /opt/rx-veiculos
cd /opt/rx-veiculos

# Clonar repositório
git clone https://github.com/marceloeliel/rx-git.git .
```

#### **4. Configurar Ambiente**
```bash
# Criar arquivo de configuração
cp .env.example .env.production
nano .env.production
```

**Configurações essenciais:**
```env
# Gerar chave secreta
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Configurar URLs
NEXTAUTH_URL=https://seudominio.com
NEXT_PUBLIC_APP_URL=https://seudominio.com

# Configurar Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Configurar Database
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

#### **5. Fazer Deploy**
```bash
# Deploy simples
docker-compose up -d

# OU Deploy com Traefik (HTTPS automático)
docker-compose -f docker-compose-traefik.yml up -d
```

---

## 🌐 **Opção 3: Deploy com Portainer**

### **1. Instalar Portainer**
```bash
docker volume create portainer_data
docker run -d \
    -p 8000:8000 \
    -p 9443:9443 \
    --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:latest
```

### **2. Configurar Stack**
1. Acesse: `https://SEU_IP:9443`
2. Configure senha no primeiro acesso
3. Vá em **Stacks** → **Add Stack**
4. Escolha **Repository**
5. Configure:
   - **Repository URL**: `https://github.com/marceloeliel/rx-git`
   - **Compose path**: `docker-compose.yml`
   - **Branch**: `main`

### **3. Configurar Variáveis**
Na seção **Environment variables**, adicione:

```env
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
DATABASE_URL=postgresql://usuario:senha@host:porta/database
NEXTAUTH_URL=https://seudominio.com
NEXT_PUBLIC_APP_URL=https://seudominio.com
WEBSITE_URL=https://seudominio.com
```

### **4. Deploy Stack**
Clique em **Deploy the stack**

---

## 🔒 **Configurar HTTPS**

### **Opção A: Nginx + Let's Encrypt**
```bash
# Instalar Nginx e Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Configurar site
sudo nano /etc/nginx/sites-available/rx-veiculos
```

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
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
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/rx-veiculos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### **Opção B: Traefik (Automático)**
Use o arquivo `docker-compose-traefik.yml` que já inclui configuração automática de HTTPS.

---

## 📊 **Comandos Úteis**

### **Gerenciar Aplicação**
```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Parar
docker-compose down

# Atualizar
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

### **Monitoramento**
```bash
# Uso de recursos
docker stats

# Logs específicos
docker-compose logs -f rx-veiculos

# Entrar no container
docker-compose exec rx-veiculos sh
```

### **Backup**
```bash
# Backup do banco (se usando PostgreSQL local)
docker exec postgres_container pg_dump -U usuario database > backup.sql

# Backup dos volumes
docker run --rm -v rx-veiculos_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

---

## 🔧 **Troubleshooting**

### **Container não inicia**
```bash
# Verificar logs
docker-compose logs rx-veiculos

# Verificar configuração
docker-compose config

# Rebuild
docker-compose build --no-cache
```

### **Erro de permissão Docker**
```bash
# Verificar grupo
groups $USER

# Adicionar ao grupo
sudo usermod -aG docker $USER
# Sair e entrar novamente
```

### **Porta em uso**
```bash
# Verificar o que usa a porta
sudo netstat -tlnp | grep :3000

# Matar processo
sudo fuser -k 3000/tcp
```

### **Problemas de SSL**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar
sudo certbot renew --dry-run

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📋 **Checklist de Deploy**

- [ ] ✅ VPS configurada e acessível
- [ ] ✅ Docker e Docker Compose instalados
- [ ] ✅ Firewall configurado (portas 80, 443, 22)
- [ ] ✅ DNS configurado para apontar para a VPS
- [ ] ✅ Repositório clonado
- [ ] ✅ Arquivo `.env.production` configurado
- [ ] ✅ Aplicação rodando via Docker
- [ ] ✅ HTTPS configurado
- [ ] ✅ Backup configurado
- [ ] ✅ Monitoramento ativo

---

## 🎯 **Vantagens do Deploy Docker**

### **🐳 Isolamento**
- Ambiente isolado e consistente
- Não interfere com outros serviços
- Fácil rollback em caso de problemas

### **🚀 Escalabilidade**
- Fácil escalar horizontalmente
- Load balancing automático
- Recursos controlados

### **🔧 Manutenção**
- Atualizações sem downtime
- Backup e restore simplificados
- Logs centralizados

### **📊 Monitoramento**
- Portainer para interface gráfica
- Métricas em tempo real
- Alertas automáticos

---

## 📞 **Suporte**

Se encontrar problemas:

1. **Verifique os logs**: `docker-compose logs -f`
2. **Teste conectividade**: Banco, APIs, DNS
3. **Verifique configurações**: `.env.production`
4. **Consulte documentação**: Arquivos do projeto

**Lembre-se**: Sempre faça backup antes de mudanças importantes!

---

## 🔗 **Links Úteis**

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Portainer Documentation](https://docs.portainer.io/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Let's Encrypt](https://letsencrypt.org/)