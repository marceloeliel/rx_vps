# 🚀 Configuração Rápida - Integração Asaas

## ⚡ Passos Essenciais

### 1. 📋 Copie as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com este conteúdo:

```env
# ========================================
# CONFIGURAÇÃO ASAAS - OBRIGATÓRIO
# ========================================

# Para DESENVOLVIMENTO (Sandbox) - COMECE AQUI
ASAAS_SANDBOX_API_KEY=SUA_CHAVE_SANDBOX_AQUI

# Para PRODUÇÃO (apenas quando for ao ar)
ASAAS_API_KEY=SUA_CHAVE_PRODUCAO_AQUI

# URL do Webhook (ajustar quando hospedar)
ASAAS_WEBHOOK_URL=http://localhost:3000/api/webhooks/asaas

# ========================================
# SUPABASE (se ainda não configurado)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. 🔑 Obter Chave do Sandbox (DESENVOLVIMENTO)

1. **Criar conta grátis**: [https://asaas.com](https://asaas.com)
2. **Fazer login** no painel
3. **Ir em**: Configurações → API → Chaves de acesso
4. **Copiar** a chave que começa com `$aact_YTU5YTE0M...`
5. **Colar** no `ASAAS_SANDBOX_API_KEY` do arquivo `.env.local`

### 3. 🗄️ Executar Script do Banco

Execute este SQL no seu Supabase (Editor SQL):

```sql
-- Cole o conteúdo completo do arquivo: scripts/create-payments-tables.sql
-- Isso criará todas as tabelas necessárias para pagamentos
```

### 4. 🎯 Configurar Webhook (Para Produção)

**Durante desenvolvimento, pule esta etapa. Configure apenas quando for ao ar.**

1. No painel Asaas: **Configurações** → **Webhooks**
2. **Novo Webhook**:
   - Nome: `RX Autos`
   - URL: `https://seudominio.com/api/webhooks/asaas`
   - Eventos: ✅ Selecionar todos de pagamento
   - Status: ✅ Ativo

## 🧪 Teste Rápido

Depois de configurar, teste no checkout:

1. **Acesse**: `http://localhost:3000/planos`
2. **Escolha** um plano
3. **Teste PIX**: Será gerado QR Code instantaneamente
4. **Teste Cartão**: Use dados fictícios (sandbox aceita qualquer cartão)

## 🎨 Códigos de Teste (Sandbox)

### Cartão Aprovado:
```
Número: 5162306219378829
Vencimento: 12/2028
CVV: 318
Nome: TESTE APROVADO
```

### Cartão Rejeitado:
```
Número: 5162306219378837
Vencimento: 12/2028  
CVV: 318
Nome: TESTE REJEITADO
```

### CPF para Testes:
```
11144477735 (sempre usar este nos testes)
```

## ✅ Verificação Rápida

Se tudo estiver funcionando:

- ✅ Servidor Next.js rodando sem erros
- ✅ Arquivo `.env.local` criado com chave do sandbox
- ✅ Tabelas criadas no Supabase
- ✅ Checkout gerando PIX/boleto sem erros

## 🚨 Problemas Comuns

### "401 Unauthorized"
❌ **Problema**: Chave de API incorreta
✅ **Solução**: Verificar se copiou a chave correta do painel Asaas

### "Table doesn't exist"
❌ **Problema**: Tabelas não foram criadas
✅ **Solução**: Executar o script SQL no Supabase

### "Cannot connect to Asaas"
❌ **Problema**: Chave não configurada
✅ **Solução**: Reiniciar servidor após adicionar a chave

## 📞 Próximos Passos

1. **Testar** todos os métodos de pagamento
2. **Configurar** webhook para produção
3. **Obter** chave de produção quando for ao ar
4. **Personalizar** mensagens e fluxos conforme necessário

---

🔥 **Dica**: Mantenha sempre a chave de produção segura e nunca a commit no Git! 