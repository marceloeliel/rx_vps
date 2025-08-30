# 🚀 LIBERAR USUÁRIOS DO PERÍODO DE TRIAL

## 📋 Descrição

Este documento explica como usar o script **"sem-limites"** para liberar usuários do período de trial e conceder acesso ilimitado à plataforma.

## 🎯 O que o Script Faz

1. **Busca o usuário** pelo email no sistema
2. **Verifica o perfil atual** (plano, status de trial, etc.)
3. **Atualiza o perfil** para acesso ilimitado
4. **Marca o trial como convertido** (se existir)
5. **Verifica a atualização** para confirmar sucesso

## 📁 Arquivo do Script

**Nome:** `sem-limites.js`  
**Localização:** Raiz do projeto

## 🚀 Como Usar

### **Sintaxe Básica**
```bash
node sem-limites.js <email_do_usuario>
```

### **Exemplos de Uso**
```bash
# Liberar usuário específico
node sem-limites.js rxnegocio@yahoo.com

# Liberar outro usuário
node sem-limites.js marcelo@teste.com

# Liberar qualquer usuário
node sem-limites.js usuario@exemplo.com
```

### **Ver Ajuda**
```bash
node sem-limites.js
```

## ✅ Usuários Já Liberados

| Usuário | Email | Data de Liberação | Status |
|---------|-------|-------------------|--------|
| 1️⃣ | `rxnegocio@yahoo.com` | 29/08/2025, 17:54:09 | ✅ Liberado |
| 2️⃣ | `marcelo@teste.com` | 29/08/2025, 17:55:19 | ✅ Liberado |

## 🔧 Alterações Realizadas

### **Na Tabela `profiles`:**
- `unlimited_access` → `true`
- `plano_atual` → `ilimitado`
- `plano_data_inicio` → Data atual
- `plano_data_fim` → `null` (sem limite de tempo)
- `updated_at` → Data atual

### **Na Tabela `trial_periods` (se existir):**
- `converted_to_paid` → `true`
- `updated_at` → Data atual

## 🎉 Resultado Final

Após executar o script, o usuário terá:
- ✅ **Acesso ilimitado** à plataforma
- ✅ **Plano ilimitado** ativo
- ✅ **Sem restrições** de tempo
- ✅ **Todas as funcionalidades** liberadas
- ✅ **Status definitivo** (não é mais trial)

## ⚠️ Requisitos

### **Variáveis de Ambiente**
O arquivo `.env.local` deve conter:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### **Dependências**
```bash
npm install @supabase/supabase-js dotenv
```

## 🔍 Verificação

### **No Dashboard Admin**
- Acesse `/admin/dashboard`
- Verifique se o usuário aparece com status "ilimitado"
- Campo `unlimited_access` deve estar marcado

### **No Supabase**
- Tabela `profiles`: verificar campos `unlimited_access` e `plano_atual`
- Tabela `trial_periods`: verificar campo `converted_to_paid`

## 🚨 Troubleshooting

### **Erro: "Usuário não encontrado"**
- Verifique se o email está correto
- Confirme se o usuário existe no sistema
- Use `node sem-limites.js` para ver usuários disponíveis

### **Erro: "Variáveis de ambiente não configuradas"**
- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão corretas
- Reinicie o terminal após alterações

### **Erro: "Erro ao atualizar perfil"**
- Verifique permissões do service role
- Confirme se a tabela `profiles` existe
- Verifique logs do Supabase

## 📝 Logs de Exemplo

### **Sucesso:**
```
🚀 SCRIPT: SEM LIMITES
========================
📧 Email: usuario@exemplo.com
📅 Data: 29/08/2025, 17:55:19

🔍 Procurando usuário usuario@exemplo.com...
✅ Usuário encontrado: usuario@exemplo.com
🆔 ID do usuário: 12345678-1234-1234-1234-123456789abc
📋 Perfil atual:
  - Nome: Nome do Usuário
  - Plano atual: premium_plus
  - Acesso ilimitado: false
  - Data início plano: 2025-08-27T14:49:17.09
  - Data fim plano: null

🔄 Atualizando perfil para acesso ilimitado...
✅ Perfil atualizado com sucesso!

🎉 USUÁRIO LIBERADO COM SUCESSO!
📧 Email: usuario@exemplo.com
🔓 Status: Acesso ilimitado ativo
📅 Data de liberação: 29/08/2025, 17:55:19

✅ Script executado com sucesso!
```

### **Erro:**
```
❌ Usuário usuario@inexistente.com não encontrado!

📋 Usuários disponíveis:
  - rxnegocio@yahoo.com (eed08b65-39e6-4e11-a752-9154f2a56497)
  - marcelo@teste.com (1acfb7f1-42db-45e9-b7d4-96ef4eeb0737)
```

## 🔄 Manutenção

### **Atualizações do Script**
- O script é independente e pode ser atualizado sem afetar o sistema
- Mantenha backup antes de alterações
- Teste sempre em ambiente de desenvolvimento primeiro

### **Monitoramento**
- Verifique logs de execução
- Monitore usuários liberados no dashboard
- Mantenha registro de todas as liberações

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme as variáveis de ambiente
3. Teste com usuário conhecido
4. Verifique permissões do Supabase

---

**🎯 LEMBRE-SE:** Este script concede acesso **PERMANENTE** e **ILIMITADO** ao usuário. Use com responsabilidade!

