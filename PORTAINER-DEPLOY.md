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
✅ **Solução**:
1. **Método Principal**: Use `docker-compose.yml` como Compose path
2. **Método Web Editor**: Copie o conteúdo do arquivo e cole no editor
3. **Verificar Branch**: Certifique-se que está usando branch `main`
4. **Repositório Público**: Confirme que o repositório está acessível

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