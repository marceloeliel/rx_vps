# 🐳 Deploy RX Veículos no Portainer

## 🚀 Guia Completo para Deploy via Portainer

### **📋 Pré-requisitos**
- Portainer instalado e configurado
- Docker e Docker Compose funcionando
- Acesso ao repositório GitHub

---

## **🔧 Método 1: Stack via Git Repository (Recomendado)**

### **1. Criar Stack no Portainer**
1. Acesse o Portainer
2. Vá em **Stacks** → **Add Stack**
3. Escolha **Repository**

> **⚠️ Problema com Repository?** Pule para o [Método 2: Web Editor](#método-2-web-editor-alternativa-confiável)

### **2. Configurar Repositório**
```
Repository URL: https://github.com/marceloeliel/rx-git
Compose path: docker-compose.yml
Branch: main
```

**💡 Alternativa**: Se houver erro com `docker-compose.yml`, use:
```
Compose path: docker-compose.portainer.yml
```

### **3. Configurar Variáveis de Ambiente**
Na seção **Environment variables**, adicione:

```env
# Essenciais
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# URLs
NEXTAUTH_URL=https://seudominio.com
NEXT_PUBLIC_APP_URL=https://seudominio.com
WEBSITE_URL=https://seudominio.com

# FIPE API
NEXT_PUBLIC_FIPE_API_TOKEN=seu_token_fipe

# PostgreSQL
POSTGRES_HOST=seu-host.supabase.com
POSTGRES_USER=postgres.seu-projeto
POSTGRES_PASSWORD=sua_senha

# Opcional
NODE_ENV=production
PORT=3000
ADMIN_EMAIL=admin@seudominio.com
```

---

## **🔧 Método 2: Stack via Web Editor**

### **1. Criar Stack**
1. **Stacks** → **Add Stack**
2. Escolha **Web editor**
3. Cole o conteúdo do arquivo `docker-compose.portainer.yml`

### **2. Configurar Variáveis**
Adicione as mesmas variáveis do Método 1

---

## **🔧 Método 3: Upload do Compose**

### **1. Preparar Arquivos**
```bash
# Baixar arquivos necessários
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/docker-compose.portainer.yml
wget https://raw.githubusercontent.com/marceloeliel/rx-git/main/Dockerfile
```

### **2. Upload no Portainer**
1. **Stacks** → **Add Stack**
2. Escolha **Upload**
3. Faça upload do `docker-compose.portainer.yml`

---

## **⚙️ Configurações Importantes**

### **🔐 Variáveis Obrigatórias**
- `NEXTAUTH_SECRET`: Gere com `openssl rand -base64 32`
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase
- `DATABASE_URL`: String de conexão PostgreSQL

### **🌐 URLs**
- `NEXTAUTH_URL`: URL completa da aplicação
- `NEXT_PUBLIC_APP_URL`: URL pública da aplicação
- `WEBSITE_URL`: URL do website

---

## **🚨 Solução de Problemas**

### **Erro: "no such file or directory: docker-compose.portainer.yml"**
✅ **Soluções (tente nesta ordem)**:

**1. Usar docker-compose.yml (Recomendado)**
```
Compose path: docker-compose.yml
```

**2. Método Web Editor**
- Escolha **Web editor** em vez de **Repository**
- Copie o conteúdo do `docker-compose.portainer.yml`
- Cole no editor do Portainer

**3. Verificações do Repositório**
- ✅ Branch: `main`
- ✅ URL: `https://github.com/marceloeliel/rx-git`
- ✅ Repositório público e acessível
- ✅ Arquivo existe no repositório

**4. Método Upload**
- Baixe o arquivo `docker-compose.portainer.yml`
- Use **Upload** no Portainer
- Faça upload do arquivo

**5. Troubleshooting Avançado**
- Teste o acesso: `https://raw.githubusercontent.com/marceloeliel/rx-git/main/docker-compose.portainer.yml`
- Verifique se o Portainer tem acesso à internet
- Tente criar uma stack simples primeiro para testar conectividade

### **Erro: ".env.local not found"**
✅ **Solução**: Use `docker-compose.yml` que tem variáveis de ambiente configuradas

### **Erro: "Build failed"**
✅ **Verificar**:
- Dockerfile está acessível
- Repositório é público ou credenciais estão corretas
- Branch está correta (main)

### **Erro: "Environment variables missing"**
✅ **Verificar**:
- Todas as variáveis obrigatórias estão definidas
- Valores não estão vazios
- Não há caracteres especiais problemáticos

---

## **🔧 Método 2: Web Editor (Alternativa Confiável)**

### **Quando usar este método:**
- Erro "no such file or directory"
- Problemas de conectividade com GitHub
- Portainer não consegue acessar o repositório

### **1. Criar Stack no Portainer**
1. Acesse o Portainer
2. Vá em **Stacks** → **Add Stack**
3. Escolha **Web editor**
4. Nome da stack: `rx-veiculos`

### **2. Copiar Conteúdo do Docker Compose**
Copie e cole o conteúdo abaixo no editor:

```yaml
# 🚗 RX Veículos - Docker Compose para Portainer
version: '3.8'

services:
  rx-veiculos:
    build:
      context: https://github.com/marceloeliel/rx-git.git
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=${PORT:-3000}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_FIPE_API_TOKEN=${NEXT_PUBLIC_FIPE_API_TOKEN}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - WEBSITE_URL=${WEBSITE_URL}
      - POSTGRES_HOST=${POSTGRES_HOST}
      - POSTGRES_PORT=${POSTGRES_PORT:-6543}
      - POSTGRES_DB=${POSTGRES_DB:-postgres}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - rx-network

networks:
  rx-network:
    driver: bridge
```

### **3. Configurar Variáveis de Ambiente**
(Use as mesmas variáveis do Método 1)

### **4. Deploy**
1. Clique em **Deploy the stack**
2. Aguarde o build e deploy

---

## **📊 Monitoramento**

### **Health Check**
A aplicação possui health check automático:
- **URL**: `http://localhost:3000`
- **Intervalo**: 30s
- **Timeout**: 10s
- **Tentativas**: 3

### **Logs**
```bash
# Ver logs da aplicação
docker logs rx-git_rx-veiculos_1

# Logs em tempo real
docker logs -f rx-git_rx-veiculos_1
```

---

## **🔄 Atualizações**

### **Via Portainer**
1. Vá na Stack
2. Clique em **Editor**
3. Clique em **Pull and redeploy**

### **Via Git Webhook**
Configure webhook no GitHub para auto-deploy:
1. **Portainer** → **Registries** → **Add webhook**
2. Configure no GitHub: **Settings** → **Webhooks**

---

## **🌐 Configuração de Domínio e SSL (Produção)**

### **⚠️ Importante para Acesso via Domínio**
Se você está tentando acessar via `https://rxnegocio.com.br/`, você precisa configurar:

### **1. Configurar Proxy Reverso no Portainer**

#### **Opção A: Traefik (Recomendado para Portainer)**
1. **Portainer** → **Stacks** → **Add stack**
2. **Nome**: `traefik-proxy`
3. **Web editor** com este código:

```yaml
version: '3.8'
services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard Traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-data:/data
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=seu-email@exemplo.com
      - --certificatesresolvers.letsencrypt.acme.storage=/data/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.rxnegocio.com.br`)"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.services.traefik.loadbalancer.server.port=8080"
    networks:
      - traefik-network

volumes:
  traefik-data:

networks:
  traefik-network:
    external: true
```

#### **Opção B: Nginx Proxy Manager (Interface Gráfica)**
1. **Portainer** → **Stacks** → **Add stack**
2. **Nome**: `nginx-proxy-manager`
3. **Web editor** com este código:

```yaml
version: '3.8'
services:
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'  # Interface Admin
    volumes:
      - nginx-data:/data
      - nginx-letsencrypt:/etc/letsencrypt
    networks:
      - proxy-network

volumes:
  nginx-data:
  nginx-letsencrypt:

networks:
  proxy-network:
    external: true
```

### **2. Modificar Stack da Aplicação RX-Veículos**

#### **Para Traefik:**
1. **Portainer** → **Stacks** → **rx-git** → **Editor**
2. Adicione estas labels no serviço `rx-veiculos`:

```yaml
services:
  rx-veiculos:
    # ... configurações existentes ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rx-veiculos.rule=Host(`rxnegocio.com.br`)"
      - "traefik.http.routers.rx-veiculos.tls.certresolver=letsencrypt"
      - "traefik.http.services.rx-veiculos.loadbalancer.server.port=3000"
    networks:
      - traefik-network
      - rx-network

networks:
  traefik-network:
    external: true
  rx-network:
    driver: bridge
```

#### **Para Nginx Proxy Manager:**
1. Acesse: `http://SEU_IP:81`
2. **Login padrão**: `admin@example.com` / `changeme`
3. **Proxy Hosts** → **Add Proxy Host**
4. **Domain Names**: `rxnegocio.com.br`
5. **Forward Hostname/IP**: `rx-veiculos` (nome do container)
6. **Forward Port**: `3000`
7. **SSL** → **Request a new SSL Certificate** → **Force SSL**

### **3. Variáveis de Ambiente para Domínio**
Atualize estas variáveis no Portainer:

```env
NEXTAUTH_URL=https://rxnegocio.com.br
NEXT_PUBLIC_APP_URL=https://rxnegocio.com.br
WEBSITE_URL=https://rxnegocio.com.br
```

### **4. Configurar DNS**
No seu provedor de domínio (Registro.br, GoDaddy, etc.):
```
Tipo: A
Nome: @
Valor: SEU_IP_DO_SERVIDOR
TTL: 3600
```

### **5. Criar Network no Portainer**
1. **Portainer** → **Networks** → **Add network**
2. **Nome**: `traefik-network` (se usar Traefik)
3. **Driver**: `bridge`
4. **Deploy**

### **6. Ordem de Deploy**
1. ✅ Criar network (`traefik-network`)
2. ✅ Deploy proxy (Traefik ou Nginx Proxy Manager)
3. ✅ Modificar stack RX-Veículos com labels
4. ✅ Atualizar variáveis de ambiente
5. ✅ Redeploy stack RX-Veículos

---

## **✅ Checklist Final**

### **Deploy Básico (Porta 3000)**
- [ ] Stack criada com sucesso
- [ ] Todas as variáveis configuradas
- [ ] Aplicação rodando (porta 3000)
- [ ] Health check passando
- [ ] Logs sem erros críticos
- [ ] Acesso via `http://SEU_IP:3000` funcionando

### **Produção com Domínio (HTTPS) - Via Portainer**
- [ ] Network `traefik-network` criada no Portainer
- [ ] Stack do proxy (Traefik ou Nginx Proxy Manager) deployada
- [ ] DNS configurado (A record apontando para o servidor)
- [ ] Stack RX-Veículos modificada com labels do proxy
- [ ] Variáveis de ambiente atualizadas com domínio HTTPS
- [ ] Stack RX-Veículos redeployada
- [ ] SSL automático funcionando (Let's Encrypt)
- [ ] Acesso via `https://rxnegocio.com.br` funcionando

### **🚀 Recomendação: Nginx Proxy Manager**
Para não-programadores, recomendo o **Nginx Proxy Manager** por ter interface gráfica:
1. Mais fácil de configurar
2. Interface web amigável
3. SSL automático com 1 clique
4. Logs visuais
5. Gerenciamento de certificados simplificado

**🎉 Sua aplicação RX Veículos está rodando no Portainer!**

---

## **🔍 Troubleshooting - Não Consegue Acessar**

### **❌ Problema: Site não carrega `https://rxnegocio.com.br`**

#### **VERIFICAÇÃO 1: DNS Propagado?**
```bash
# Teste no seu computador
nslookup rxnegocio.com.br
# Deve retornar o IP do seu servidor
```

#### **VERIFICAÇÃO 2: Nginx Proxy Manager funcionando?**
1. Acesse: `http://SEU_IP:81`
2. Se não abrir → Nginx Proxy Manager não está rodando
3. **Portainer** → **Containers** → Verifique se `nginx-proxy-manager` está **running**

#### **VERIFICAÇÃO 3: Proxy Host configurado?**
1. Acesse: `http://SEU_IP:81`
2. **Proxy Hosts** → Deve ter `rxnegocio.com.br` listado
3. **Status**: deve estar **Online** (verde)

#### **VERIFICAÇÃO 4: SSL Certificate gerado?**
1. **Nginx Proxy Manager** → **SSL Certificates**
2. Deve ter certificado para `rxnegocio.com.br`
3. **Status**: deve estar **Valid**

#### **VERIFICAÇÃO 5: Container RX-Veículos rodando?**
1. **Portainer** → **Containers**
2. Container `rx-veiculos` deve estar **running**
3. **Health**: deve estar **healthy** (verde)

#### **VERIFICAÇÃO 6: Networks conectadas?**
1. **Portainer** → **Containers** → `rx-veiculos` → **Inspect**
2. **Networks**: deve ter `proxy-network` E `rx-network`

### **🚨 Soluções Rápidas**

#### **Se Porta 3000 Bloqueada (Firewall):**

**🔥 SOLUÇÃO MAIS PROVÁVEL - LIBERAR PORTA 3000**

**Via SSH no servidor:**
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 3000
sudo ufw reload

# CentOS/RHEL (Firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Método alternativo (iptables)
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save
```

**Verificar se a porta foi liberada:**
```bash
# Testar se a porta está aberta
sudo netstat -tlnp | grep :3000
# ou
sudo ss -tlnp | grep :3000

# Verificar regras do firewall
sudo ufw status
# ou
sudo firewall-cmd --list-ports
```

**⚠️ IMPORTANTE:** Após liberar a porta, teste imediatamente:
- `http://31.97.92.120:3000`
- Se funcionar, o problema era o firewall
- Se não funcionar, verifique os logs do container

#### **Se DNS não propagou (24-48h):**
```
# Teste temporário editando hosts
# Windows: C:\Windows\System32\drivers\etc\hosts
# Adicione esta linha:
SEU_IP_SERVIDOR rxnegocio.com.br
```

#### **Se Nginx Proxy Manager não roda:**
1. **Portainer** → **Stacks** → `nginx-proxy-manager`
2. **Editor** → **Update the stack**
3. Aguarde deploy

#### **Se RX-Veículos não conecta ao proxy:**
1. **Portainer** → **Stacks** → `rx-git` → **Editor**
2. Verifique se tem estas linhas:
```yaml
    networks:
      - rx-network
      - proxy-network
```
3. **Update the stack**

#### **Se SSL falha:**
1. **Nginx Proxy Manager** → **Proxy Hosts**
2. **Edit** o host `rxnegocio.com.br`
3. **SSL** → **Request a new SSL Certificate**
4. **Save**

### **📋 Checklist de Diagnóstico**

- [ ] DNS aponta para o servidor (`nslookup rxnegocio.com.br`)
- [ ] Nginx Proxy Manager acessível (`http://SEU_IP:81`)
- [ ] Proxy Host criado para `rxnegocio.com.br`
- [ ] SSL Certificate válido
- [ ] Container `rx-veiculos` rodando
- [ ] Container `nginx-proxy-manager` rodando
- [ ] Networks `proxy-network` conectadas
- [ ] Portas 80 e 443 abertas no firewall

### **🆘 Teste de Emergência**

Se nada funcionar, teste o acesso direto:
```
http://SEU_IP:3000
```

Se funcionar → problema é no proxy
Se não funcionar → problema é na aplicação

**💡 Dica**: Verifique os logs no Portainer para mais detalhes dos erros.