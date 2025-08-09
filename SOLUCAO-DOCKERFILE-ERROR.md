# 🔧 **Solução: Dockerfile Error no Portainer**

## ❌ **Erro Encontrado:**
```
Failed to deploy a stack: compose build operation failed: 
failed to solve: failed to read dockerfile: 
open Dockerfile: no such file or directory
```

## 🔍 **Causa do Problema:**

O erro acontece porque:
1. **Git Repository no Portainer** não consegue acessar o Dockerfile
2. **Build context** não está configurado corretamente
3. **Permissões** ou **path** incorretos

## ✅ **2 Soluções Disponíveis:**

### **Opção 1: Deploy via Git Repository (Recomendado)**

**Arquivo:** `docker-compose-portainer-git.yml`

**Vantagens:**
- ✅ Funciona direto no Portainer Git Repository
- ✅ Não depende de build local
- ✅ Atualização automática via Git
- ✅ Inclui todas as dependências necessárias

**Como usar:**
1. **Portainer → Stacks → Add Stack**
2. **Selecione "Git Repository"**
3. **Repository URL:** `https://github.com/marceloeliel/rx-git.git`
4. **Compose path:** `docker-compose-portainer-git.yml`
5. **Configure as variáveis de ambiente**
6. **Deploy!**

### **Opção 2: Deploy via Web Editor**

**Arquivo:** `docker-compose-stack-portainer.yml`

**Como usar:**
1. **Portainer → Stacks → Add Stack**
2. **Selecione "Web Editor"**
3. **Cole o conteúdo do arquivo**
4. **Configure as variáveis de ambiente**
5. **Deploy!**

## 🚀 **Configuração das Variáveis (Ambas Opções):**

```env
# Obrigatórias
NEXTAUTH_SECRET=seu_secret_super_seguro_aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
DATABASE_URL=postgresql://postgres:[password]@db.seu-projeto.supabase.co:5432/postgres
NEXT_PUBLIC_FIPE_API_TOKEN=seu_token_fipe_aqui

# Opcionais (já configuradas)
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXTAUTH_URL=https://rxnegocio.com.br
NEXT_PUBLIC_APP_URL=https://rxnegocio.com.br
WEBSITE_URL=https://rxnegocio.com.br
```

## 🔧 **Principais Melhorias da Solução:**

### **Dependências Corrigidas:**
```bash
apk add --no-cache git ca-certificates openssl dumb-init curl wget
```

### **Processo Otimizado:**
1. **Instala dependências** (git, ca-certificates, etc.)
2. **Clona repositório** atualizado
3. **Instala pnpm** (mais rápido que npm)
4. **Instala dependências** do projeto
5. **Faz build** da aplicação
6. **Inicia com dumb-init** (gerenciamento de processos)

### **Health Check Melhorado:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
  start_period: 180s  # Mais tempo para build inicial
```

### **Configuração Traefik Completa:**
- ✅ HTTPS automático com Let's Encrypt
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Configuração de rede externa
- ✅ Labels corretas para roteamento

## ⚠️ **Pré-requisitos:**

1. **Rede Traefik criada:**
   ```bash
   docker network create traefik
   ```

2. **Traefik rodando** com configuração Let's Encrypt

3. **DNS apontando** para o servidor:
   ```
   rxnegocio.com.br → IP_DO_SERVIDOR
   ```

## 🎯 **Recomendação:**

**Use a Opção 1 (Git Repository)** pois:
- ✅ Mais fácil de manter
- ✅ Atualizações automáticas
- ✅ Não depende de build local
- ✅ Funciona direto no Portainer

Esta solução resolve **100% do problema** do Dockerfile e garante deploy profissional! 🚀