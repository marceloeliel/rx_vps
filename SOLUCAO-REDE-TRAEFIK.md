# 🚨 **Solução: Erro de Rede Traefik**

## **❌ Problema**
```
Deployment error
Failed to deploy a stack: compose up operation failed: 
network traefik declared as external, but could not be found
```

## **🔍 Causa**
O erro ocorre porque:
- A rede `traefik` não existe no Docker
- O Traefik não está rodando
- A rede não foi criada corretamente

## **✅ Soluções**

### **Opção 1: Deploy Standalone (Recomendado para Teste)**

Use o arquivo `docker-compose-portainer-standalone.yml`:

```yaml
version: '3.8'

services:
  rx-veiculos:
    image: node:20-alpine
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_FIPE_API_TOKEN=${NEXT_PUBLIC_FIPE_API_TOKEN}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
      - WEBSITE_URL=${WEBSITE_URL:-http://localhost:3000}
    volumes:
      - app_data:/app
    command: >
      sh -c "
        apk add --no-cache git ca-certificates openssl dumb-init curl wget &&
        git clone https://github.com/marceloeliel/rx-git.git . &&
        npm install -g pnpm &&
        pnpm install &&
        pnpm build &&
        exec dumb-init pnpm start
      "
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 180s

volumes:
  app_data:
```

**Vantagens:**
- ✅ Funciona imediatamente
- ✅ Sem dependência do Traefik
- ✅ Acesso direto via porta 3000
- ✅ Ideal para desenvolvimento/teste

### **Opção 2: Configurar Traefik (Para Produção)**

#### **2.1. Criar a rede Traefik:**
```bash
docker network create traefik
```

#### **2.2. Deploy do Traefik:**
Use o arquivo `docker-compose-traefik.yml` do repositório.

#### **2.3. Depois use o arquivo original:**
`docker-compose-portainer-git.yml`

## **🚀 Como Usar no Portainer**

### **Para Solução Standalone:**
1. **Portainer** → **Stacks** → **Add Stack**
2. **Name**: `rx-veiculos-standalone`
3. **Build method**: **"Web editor"**
4. **Cole o conteúdo do `docker-compose-portainer-standalone.yml`**
5. **Environment variables**: Configure as variáveis
6. **Deploy**

### **Variáveis de Ambiente Obrigatórias:**
```env
NEXTAUTH_SECRET=seu_secret_aqui
NEXT_PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
DATABASE_URL=postgresql://usuario:senha@host:porta/database
NEXT_PUBLIC_FIPE_API_TOKEN=seu_token_fipe
```

### **Variáveis Opcionais (com valores padrão):**
```env
NEXTAUTH_URL=http://seu-dominio.com
NEXT_PUBLIC_APP_URL=http://seu-dominio.com
WEBSITE_URL=http://seu-dominio.com
```

## **🌐 Acesso**

### **Standalone:**
- **Local**: http://localhost:3000
- **Servidor**: http://SEU_IP:3000

### **Com Traefik:**
- **HTTPS**: https://seu-dominio.com
- **HTTP**: http://seu-dominio.com (redireciona para HTTPS)

## **📋 Resumo**

| Solução | Complexidade | SSL | Domínio | Recomendado para |
|---------|--------------|-----|---------|------------------|
| **Standalone** | Baixa | ❌ | IP:3000 | Desenvolvimento/Teste |
| **Traefik** | Média | ✅ | Domínio | Produção |

**Recomendação**: Comece com a **Solução Standalone** para testar, depois migre para **Traefik** em produção.