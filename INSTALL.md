# 🚀 Guia de Instalação Completo - RX Veículos

Este guia contém **scripts automáticos** e **instruções manuais** para instalar o RX Veículos sem erros.

## 📦 **Instalação Automática (Recomendado)**

### **Para Linux/Mac:**
```bash
curl -fsSL https://raw.githubusercontent.com/marceloeliel/rx-git/master/install.sh | bash
```

### **Para Windows:**
```powershell
# PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr https://raw.githubusercontent.com/marceloeliel/rx-git/master/install.ps1 | iex
```

---

## 🛠️ **Instalação Manual**

### **1. Pré-requisitos**

#### **Instalar Node.js 18+:**
- **Linux/Mac:**
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  
  # macOS
  brew install node@20
  ```

- **Windows:**
  - Baixe em: https://nodejs.org
  - Instale a versão LTS (20.x)

#### **Instalar pnpm:**
```bash
npm install -g pnpm
```

#### **Verificar Git:**
```bash
git --version
```

### **2. Clonar Repositório**
```bash
git clone https://github.com/marceloeliel/rx-git.git
cd rx-git
```

### **3. Instalar Dependências**
```bash
pnpm install
```

### **4. Configurar Ambiente**
```bash
# Copiar arquivo de exemplo
cp env-production-example.txt .env.local

# Editar com suas credenciais
nano .env.local  # Linux/Mac
notepad .env.local  # Windows
```

### **5. Configurar Variáveis de Ambiente**

Edite `.env.local` com suas credenciais:

```env
# ============================================
# SUPABASE - DATABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL="SUA_URL_SUPABASE"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_ANONIMA"
SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE"

# ============================================
# ASAAS - PAGAMENTOS
# ============================================
ASAAS_API_KEY="SUA_CHAVE_ASAAS"
ASAAS_BASE_URL="https://www.asaas.com/api/v3"

# ============================================
# NEXT.JS
# ============================================
NEXTAUTH_SECRET="seu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

### **6. Executar Projeto**

#### **Desenvolvimento:**
```bash
pnpm dev
```

#### **Produção:**
```bash
pnpm build
pnpm start
```

#### **Acessar:**
- 🌐 **Local:** http://localhost:3000
- 📱 **Rede:** http://SEU_IP:3000

---

## 🔧 **Configuração das APIs**

### **Supabase Setup:**

1. **Criar projeto:** https://supabase.com
2. **Executar scripts SQL:**
   ```bash
   # Na pasta scripts/, execute em ordem:
   - create-profiles-table.sql
   - create-veiculos-table.sql
   - create-dados-agencia-table.sql
   - create-payments-tables.sql
   ```
3. **Configurar RLS:**
   - Ative Row Level Security
   - Execute scripts de políticas

### **ASAAS Setup:**

1. **Criar conta:** https://asaas.com
2. **Modo Sandbox:** Para testes
3. **Obter API Key:** Painel → Integração
4. **Configurar Webhook:** (opcional)

---

## 🐛 **Solução de Problemas**

### **Node.js não encontrado:**
```bash
# Verificar instalação
node --version
npm --version

# Se não instalado, baixar em nodejs.org
```

### **Erro de permissão (Linux/Mac):**
```bash
# Corrigir permissões npm
sudo chown -R $(whoami) ~/.npm
```

### **Porta 3000 ocupada:**
```bash
# Linux/Mac
sudo lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Erro de build:**
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

### **Erro de SSL (desenvolvimento):**
```bash
# Desabilitar verificação SSL temporariamente
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

---

## 📱 **Verificar PWA**

Após instalação, teste o PWA:

1. **Abra:** http://localhost:3000
2. **Mobile:** Use DevTools → Device Mode
3. **Instalar:** Deve aparecer banner de instalação
4. **Offline:** Teste desconectando internet

---

## 🚀 **Deploy em Produção**

### **VPS Ubuntu (Completo):**
Consulte: `DEPLOY-COMPLETO.md`

### **Vercel (Rápido):**
```bash
npx vercel --prod
```

### **Docker:**
```bash
docker build -t rx-veiculos .
docker run -p 3000:3000 rx-veiculos
```

---

## ✅ **Checklist de Instalação**

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado  
- [ ] Git instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] `.env.local` configurado
- [ ] Supabase configurado
- [ ] ASAAS configurado
- [ ] Projeto executando em dev
- [ ] Build de produção funcionando
- [ ] PWA testado

---

## 📞 **Suporte**

**Se algo der errado:**

1. **Verifique logs** no terminal
2. **Consulte** seção "Solução de Problemas"
3. **Abra issue** no GitHub
4. **Contato:** Issues do repositório

---

## 🎯 **Próximos Passos**

Após instalação:

1. **Configure** seu perfil de agência
2. **Cadastre** alguns veículos
3. **Teste** o sistema de pagamentos
4. **Configure** notificações PWA
5. **Deploy** em produção

---

**🎉 Instalação concluída! Seu RX Veículos está pronto para usar!** 