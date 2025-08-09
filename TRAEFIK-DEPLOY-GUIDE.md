# 🚗 RX Veículos - Guia de Deploy com Traefik

## 🚨 Problema Identificado: Exit Code 128

**Causa:** O container Alpine não possui `git` e `ca-certificates` instalados, causando falha no processo de build.

**Solução:** Dockerfile corrigido com dependências necessárias.

---

## 📋 Pré-requisitos

✅ **Verificar se você tem:**
- Traefik rodando nas portas 80 e 443
- Rede `traefik` criada
- Domínio `rxnegocio.com.br` apontando para o IP da VPS
- Firewall UFW desativado (conforme informado)

---

## 🔧 Passo 1: Verificar Rede do Traefik

```bash
# Verificar se a rede traefik existe
docker network ls | grep traefik

# Se não existir, criar:
docker network create traefik
```

---

## 🐳 Passo 2: Usar Dockerfile Corrigido

**Renomeie o Dockerfile atual:**
```bash
mv Dockerfile Dockerfile.old
mv Dockerfile-fixed Dockerfile
```

**Principais correções no Dockerfile:**
- ✅ Adicionado `git` e `ca-certificates` no Alpine
- ✅ Adicionado `curl` e `wget` para health checks
- ✅ Configurado `HOSTNAME="0.0.0.0"` para aceitar conexões externas
- ✅ Melhorado health check com `wget`
- ✅ Adicionado `dumb-init` para melhor gerenciamento de processos

---

## 📝 Passo 3: Configurar Variáveis de Ambiente

**Crie um arquivo `.env` com suas variáveis:**
```env
# Autenticação
NEXTAUTH_SECRET=sua-chave-secreta-muito-forte-aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Database
DATABASE_URL=postgresql://usuario:senha@host:5432/database

# Postgres (se usando separado)
POSTGRES_HOST=seu-host
POSTGRES_PORT=5432
POSTGRES_DB=seu-database
POSTGRES_USER=seu-usuario
POSTGRES_PASSWORD=sua-senha
POSTGRES_POOL_MODE=transaction

# APIs
NEXT_PUBLIC_FIPE_API_TOKEN=seu-token-fipe
WEBHOOK_URL=https://rxnegocio.com.br/api/webhooks

# Admin
ADMIN_EMAIL=seu-email@exemplo.com
```

---

## 🚀 Passo 4: Deploy com Portainer

### **Opção A: Via Portainer Web UI**

1. **Portainer** → **Stacks** → **Add Stack**
2. **Name:** `rx-veiculos-traefik`
3. **Web editor:** Cole o conteúdo do `docker-compose-traefik.yml`
4. **Environment variables:** Adicione suas variáveis do `.env`
5. **Deploy the stack**

### **Opção B: Via Git Repository**

1. **Portainer** → **Stacks** → **Add Stack**
2. **Name:** `rx-veiculos-traefik`
3. **Repository URL:** `https://github.com/marceloeliel/rx-git.git`
4. **Compose path:** `docker-compose-traefik.yml`
5. **Environment variables:** Adicione suas variáveis
6. **Deploy the stack**

---

## 🔍 Passo 5: Verificar Deploy

### **1. Verificar Container**
```bash
# Verificar se o container está rodando
docker ps | grep rx-veiculos

# Verificar logs
docker logs rx-veiculos-traefik_rx-veiculos_1
```

### **2. Verificar Health Check**
```bash
# Status do health check
docker inspect rx-veiculos-traefik_rx-veiculos_1 | grep Health -A 10
```

### **3. Verificar Traefik**
```bash
# Verificar se o Traefik detectou o serviço
curl -H "Host: rxnegocio.com.br" http://localhost
```

---

## 🌐 Passo 6: Testar HTTPS

### **Aguardar Certificado SSL (1-2 minutos)**
```bash
# Testar HTTP (deve redirecionar para HTTPS)
curl -I http://rxnegocio.com.br

# Testar HTTPS
curl -I https://rxnegocio.com.br
```

### **Verificar no Navegador**
- Acesse: `https://rxnegocio.com.br`
- Deve mostrar certificado válido Let's Encrypt
- App deve carregar normalmente

---

## 🛠️ Troubleshooting

### **❌ Container com Exit Code 128**
```bash
# Verificar logs detalhados
docker logs --details rx-veiculos-traefik_rx-veiculos_1

# Reconstruir imagem
docker-compose -f docker-compose-traefik.yml build --no-cache
docker-compose -f docker-compose-traefik.yml up -d
```

### **❌ Traefik não detecta o serviço**
```bash
# Verificar se está na rede correta
docker inspect rx-veiculos-traefik_rx-veiculos_1 | grep NetworkMode

# Verificar labels
docker inspect rx-veiculos-traefik_rx-veiculos_1 | grep -A 20 Labels
```

### **❌ Certificado SSL não gerado**
```bash
# Verificar logs do Traefik
docker logs traefik

# Verificar se o domínio resolve
nslookup rxnegocio.com.br
```

### **❌ App não responde**
```bash
# Testar diretamente no container
docker exec -it rx-veiculos-traefik_rx-veiculos_1 wget -qO- http://localhost:3000

# Verificar variáveis de ambiente
docker exec -it rx-veiculos-traefik_rx-veiculos_1 env | grep NEXT
```

---

## ✅ Checklist Final

- [ ] Dockerfile corrigido está sendo usado
- [ ] Rede `traefik` existe e está configurada
- [ ] Todas as variáveis de ambiente estão preenchidas
- [ ] Container está rodando sem Exit Code 128
- [ ] Health check está passando
- [ ] Traefik detectou o serviço
- [ ] HTTP redireciona para HTTPS
- [ ] Certificado SSL foi gerado
- [ ] App carrega em `https://rxnegocio.com.br`

---

## 🎯 Resultado Esperado

✅ **App rodando em:** `https://rxnegocio.com.br`  
✅ **Certificado SSL:** Let's Encrypt automático  
✅ **Redirecionamento:** HTTP → HTTPS  
✅ **Container:** Estável, sem reinicializações  
✅ **Performance:** Otimizada para produção  

---

## 📞 Suporte

Se ainda houver problemas:
1. Verifique os logs do container
2. Verifique os logs do Traefik
3. Confirme que todas as variáveis estão corretas
4. Teste o health check manualmente

**O Exit Code 128 deve estar resolvido com o Dockerfile corrigido!**