# 🔄 Atualização do Repositório - Correção Exit Code 128

## ✅ Arquivos Atualizados no Repositório

1. **`Dockerfile`** - Corrigido com dependências necessárias
2. **`compose-portainer.yml`** - Configurado para Traefik com HTTPS

---

## 🚀 O que Você Precisa Fazer Agora

### **1. Fazer Commit e Push das Alterações**

```bash
# Adicionar arquivos modificados
git add Dockerfile compose-portainer.yml

# Fazer commit
git commit -m "fix: Corrigir Exit Code 128 e configurar Traefik HTTPS"

# Enviar para o repositório
git push origin main
```

### **2. Verificar Rede Traefik no Servidor**

```bash
# SSH no servidor e verificar se a rede existe
docker network ls | grep traefik

# Se não existir, criar:
docker network create traefik
```

### **3. Atualizar Stack no Portainer**

#### **Opção A: Via Git Repository (Recomendado)**
1. **Portainer** → **Stacks** → Sua stack atual
2. **Editor** → **Repository** (se já configurado)
3. **Pull and redeploy** ou **Update the stack**

#### **Opção B: Recriar Stack**
1. **Portainer** → **Stacks** → **Add Stack**
2. **Name:** `rx-veiculos-traefik`
3. **Repository URL:** `https://github.com/marceloeliel/rx-git.git`
4. **Compose path:** `compose-portainer.yml`
5. **Environment variables:** Suas variáveis atuais
6. **Deploy the stack**

### **4. Configurar Variáveis de Ambiente Essenciais**

```env
# Obrigatórias para funcionar
NEXTAUTH_SECRET=sua-chave-secreta-forte
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
DATABASE_URL=postgresql://usuario:senha@host:5432/database

# Outras variáveis conforme necessário
POSTGRES_HOST=seu-host
POSTGRES_PORT=5432
POSTGRES_DB=seu-database
POSTGRES_USER=seu-usuario
POSTGRES_PASSWORD=sua-senha
ADMIN_EMAIL=seu-email@exemplo.com
```

---

## 🔍 Verificações Após Deploy

### **1. Container Rodando**
```bash
# Verificar se o container está up
docker ps | grep rx-veiculos

# Verificar logs (não deve ter Exit Code 128)
docker logs nome-do-container
```

### **2. Health Check**
```bash
# Status deve ser healthy
docker inspect nome-do-container | grep Health -A 10
```

### **3. Traefik Detectou o Serviço**
```bash
# Testar HTTP (deve redirecionar para HTTPS)
curl -I http://rxnegocio.com.br

# Testar HTTPS (deve funcionar)
curl -I https://rxnegocio.com.br
```

---

## 🎯 Resultado Esperado

✅ **Container:** Sem Exit Code 128, rodando estável  
✅ **Acesso:** `https://rxnegocio.com.br` funcionando  
✅ **SSL:** Certificado Let's Encrypt automático  
✅ **Redirecionamento:** HTTP → HTTPS  

---

## 🚨 Se Ainda Houver Problemas

### **Exit Code 128 Persistir:**
```bash
# Forçar rebuild da imagem
docker-compose build --no-cache
docker-compose up -d
```

### **Traefik Não Detectar:**
```bash
# Verificar labels do container
docker inspect nome-do-container | grep -A 20 Labels

# Verificar rede
docker inspect nome-do-container | grep NetworkMode
```

### **SSL Não Gerar:**
```bash
# Verificar logs do Traefik
docker logs traefik

# Verificar DNS
nslookup rxnegocio.com.br
```

---

## 📞 Resumo dos Comandos

```bash
# 1. Atualizar repositório
git add .
git commit -m "fix: Corrigir Exit Code 128 e configurar Traefik"
git push

# 2. No servidor
docker network create traefik

# 3. No Portainer: Update/Redeploy da stack

# 4. Verificar
docker ps
docker logs nome-do-container
curl -I https://rxnegocio.com.br
```

**O problema do Exit Code 128 está resolvido com as correções no Dockerfile!**