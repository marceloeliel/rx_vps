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

## **✅ Checklist Final**

- [ ] Stack criada com sucesso
- [ ] Todas as variáveis configuradas
- [ ] Aplicação rodando (porta 3000)
- [ ] Health check passando
- [ ] Logs sem erros críticos
- [ ] Acesso via browser funcionando

**🎉 Sua aplicação RX Veículos está rodando no Portainer!**