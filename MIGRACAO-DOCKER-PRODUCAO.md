# 🐳 Migração para Docker em Produção

## 📋 Guia Completo de Migração

Este guia detalha como remover a instalação atual do RX Veículos na VPS e reinstalar usando Docker para produção.

---

## 🗑️ **PASSO 1: Remover Instalação Atual**

### **1.1 Fazer Backup (Recomendado)**
```bash
# Backup das configurações
sudo cp -r /var/www/rx-veiculos/.env* ~/backup-env/ 2>/dev/null || true

# Backup do banco (se local)
pg_dump sua_database > ~/backup-database.sql 2>/dev/null || true
```

### **1.2 Executar Script de Remoção**
```bash
# Baixar e executar script de limpeza
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/remove-vps-installation.sh
chmod +x remove-vps-installation.sh
./remove-vps-installation.sh
```

**O script irá:**
- ✅ Parar e remover aplicação PM2
- ✅ Parar e remover serviço systemd
- ✅ Remover configuração Nginx
- ✅ Remover diretório da aplicação
- ✅ Limpar processos órfãos
- ✅ Verificar portas em uso

---

## 🐳 **PASSO 2: Instalar Docker e Ambiente**

### **2.1 Executar Script de Instalação**
```bash
# Baixar e executar script de instalação
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/install-docker-production.sh
chmod +x install-docker-production.sh
./install-docker-production.sh
```

**O script irá:**
- ✅ Atualizar sistema
- ✅ Instalar Docker e Docker Compose
- ✅ Configurar firewall
- ✅ Instalar Portainer (opcional)
- ✅ Clonar repositório
- ✅ Criar arquivo de configuração

### **2.2 Reiniciar Sessão**
```bash
# Sair e entrar novamente para aplicar permissões Docker
exit
# Conectar novamente via SSH
```

---

## ⚙️ **PASSO 3: Configurar Ambiente**

### **3.1 Editar Configurações**
```bash
cd /opt/rx-veiculos
nano .env.production
```

### **3.2 Configurações Essenciais**
```env
# Gerar chave secreta
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Configurar domínio
NEXTAUTH_URL=https://seudominio.com
NEXT_PUBLIC_APP_URL=https://seudominio.com
WEBSITE_URL=https://seudominio.com

# Configurar Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Configurar Database
DATABASE_URL=postgresql://usuario:senha@host:porta/database
```

---

## 🚀 **PASSO 4: Deploy da Aplicação**

### **4.1 Opção A: Deploy Simples com Docker Compose**
```bash
cd /opt/rx-veiculos

# Iniciar aplicação
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

### **4.2 Opção B: Deploy com Portainer**

1. **Acesse Portainer**: `https://SEU_IP:9443`
2. **Configure senha** no primeiro acesso
3. **Criar Stack**:
   - Vá em **Stacks** → **Add Stack**
   - Nome: `rx-veiculos`
   - Escolha **Repository**
   - URL: `https://github.com/marceloeliel/rx-git`
   - Compose path: `docker-compose.yml`
   - Branch: `main`

4. **Configurar Variáveis** (copie do `.env.production`)

5. **Deploy Stack**

### **4.3 Opção C: Deploy com Traefik (HTTPS Automático)**
```bash
# Usar compose com Traefik
docker-compose -f docker-compose-traefik.yml up -d
```

---

## 🌐 **PASSO 5: Configurar Proxy Reverso (HTTPS)**

### **5.1 Nginx + Let's Encrypt**
```bash
# Instalar Nginx
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

### **5.2 Traefik (Automático)**
O arquivo `docker-compose-traefik.yml` já inclui configuração automática de HTTPS.

---

## 📊 **PASSO 6: Monitoramento e Manutenção**

### **6.1 Comandos Úteis**
```bash
# Ver status dos containers
docker ps

# Ver logs da aplicação
docker-compose logs -f rx-veiculos

# Reiniciar aplicação
docker-compose restart

# Atualizar aplicação
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Backup do banco
docker exec postgres_container pg_dump -U usuario database > backup.sql
```

### **6.2 Monitoramento com Portainer**
- **Containers**: Status, logs, estatísticas
- **Images**: Gerenciar imagens Docker
- **Volumes**: Backup e restore
- **Networks**: Configuração de rede

---

## 🔧 **Troubleshooting**

### **Problema: Container não inicia**
```bash
# Verificar logs
docker-compose logs rx-veiculos

# Verificar configurações
docker-compose config

# Rebuild sem cache
docker-compose build --no-cache
```

### **Problema: Erro de permissão**
```bash
# Verificar se usuário está no grupo docker
groups $USER

# Adicionar ao grupo (se necessário)
sudo usermod -aG docker $USER
# Sair e entrar novamente
```

### **Problema: Porta em uso**
```bash
# Verificar o que está usando a porta
sudo netstat -tlnp | grep :3000

# Matar processo
sudo fuser -k 3000/tcp
```

### **Problema: SSL/HTTPS**
```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew --dry-run
```

---

## 📋 **Checklist Final**

- [ ] ✅ Instalação anterior removida
- [ ] ✅ Docker e Docker Compose instalados
- [ ] ✅ Repositório clonado
- [ ] ✅ Arquivo `.env.production` configurado
- [ ] ✅ Aplicação rodando via Docker
- [ ] ✅ Proxy reverso configurado (Nginx/Traefik)
- [ ] ✅ HTTPS configurado
- [ ] ✅ DNS apontando para o servidor
- [ ] ✅ Firewall configurado
- [ ] ✅ Backup configurado
- [ ] ✅ Monitoramento ativo

---

## 🎯 **Vantagens da Nova Configuração**

### **🐳 Docker**
- ✅ Isolamento de ambiente
- ✅ Fácil deploy e rollback
- ✅ Escalabilidade
- ✅ Consistência entre ambientes

### **📊 Portainer**
- ✅ Interface gráfica para gerenciar containers
- ✅ Monitoramento em tempo real
- ✅ Deploy simplificado
- ✅ Backup e restore fácil

### **🔒 Segurança**
- ✅ Containers isolados
- ✅ Firewall configurado
- ✅ HTTPS automático
- ✅ Atualizações controladas

### **🚀 Performance**
- ✅ Otimização de recursos
- ✅ Cache de imagens
- ✅ Load balancing (se necessário)
- ✅ Monitoramento de recursos

---

## 📞 **Suporte**

Se encontrar problemas durante a migração:

1. **Verifique os logs**: `docker-compose logs -f`
2. **Consulte a documentação**: Arquivos README do projeto
3. **Verifique configurações**: `.env.production`
4. **Teste conectividade**: Banco de dados, APIs externas

**Lembre-se**: Sempre faça backup antes de mudanças importantes!