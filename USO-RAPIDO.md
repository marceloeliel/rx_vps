# ⚡ USO RÁPIDO - SCRIPT SEM LIMITES

## 🚀 **COMANDO PRINCIPAL**
```bash
node sem-limites.js <email_do_usuario>
```

## 📋 **EXEMPLOS PRÁTICOS**

### **Liberar Usuário Específico:**
```bash
node sem-limites.js rxnegocio@yahoo.com
```

### **Ver Ajuda:**
```bash
node sem-limites.js
```

### **Lista de Usuários Disponíveis:**
```bash
# Execute sem parâmetros para ver todos os usuários
node sem-limites.js
```

## ✅ **O QUE O SCRIPT FAZ AUTOMATICAMENTE**

1. **🔍 Busca o usuário** pelo email
2. **📋 Mostra perfil atual** (plano, status, etc.)
3. **🔄 Atualiza para acesso ilimitado**
4. **✅ Marca trial como convertido**
5. **🔍 Verifica sucesso da operação**

## 🎯 **RESULTADO FINAL**

Após executar, o usuário terá:
- ✅ **Acesso ilimitado** à plataforma
- ✅ **Plano ilimitado** ativo
- ✅ **Sem restrições** de tempo
- ✅ **Todas as funcionalidades** liberadas

## ⚠️ **REQUISITOS**

- Arquivo `.env.local` configurado
- Dependências instaladas (`npm install`)
- Usuário deve existir no sistema

## 🚨 **PROBLEMAS COMUNS**

### **"Usuário não encontrado"**
```bash
# Ver todos os usuários disponíveis
node sem-limites.js
```

### **"Variáveis de ambiente não configuradas"**
- Verifique se `.env.local` existe
- Confirme `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

### **"Erro ao atualizar perfil"**
- Verifique permissões do service role
- Confirme se a tabela `profiles` existe

## 📊 **USUÁRIOS JÁ LIBERADOS**

| Email | Status | Data |
|-------|--------|------|
| `rxnegocio@yahoo.com` | ✅ Liberado | 29/08/2025 |
| `marcelo@teste.com` | ✅ Liberado | 29/08/2025 |

## 🔄 **MANUTENÇÃO**

### **Verificar Status:**
- Acesse `/admin/dashboard`
- Procure pelo email do usuário
- Campo `unlimited_access` deve estar marcado

### **Resetar Trial:**
- Delete registro da tabela `trial_periods`
- Usuário receberá novo trial automaticamente

---

## 🎉 **RESUMO: 1 COMANDO, USUÁRIO LIBERADO!**

```bash
node sem-limites.js email@usuario.com
```

**É isso!** O script faz todo o resto automaticamente! 🚀

