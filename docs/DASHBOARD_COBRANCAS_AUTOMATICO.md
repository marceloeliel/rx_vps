# 🚀 Dashboard Automático de Cobranças

## 📝 Sobre

Sistema automático que mostra as cobranças do usuário sem necessidade de configuração manual. O sistema busca automaticamente as cobranças baseadas no `asaas_customer_id` do usuário.

## ✅ O que foi implementado

### 1. **Componente Dashboard** (`components/dashboard-cobrancas.tsx`)
- ✅ **Busca automática** das cobranças do usuário logado
- ✅ **Estatísticas em tempo real**: Total, Pendentes, Pagos, Vencidos
- ✅ **Resumo financeiro**: Valor total, em aberto, recebido
- ✅ **Lista detalhada** com status e tipos de pagamento
- ✅ **Loading e erro** com retry automático
- ✅ **Logs detalhados** para debug

### 2. **API Route** (`app/api/asaas/payments/user/[userId]/route.ts`)
- ✅ **Busca pagamentos** por customer_id do Asaas
- ✅ **Paginação** (50 itens por página)
- ✅ **Tratamento de erros** completo
- ✅ **Logs para monitoramento**

### 3. **Página Dedicada** (`app/minhas-cobrancas/page.tsx`)
- ✅ **Interface clean** focada nas cobranças
- ✅ **Responsiva** para desktop e mobile

### 4. **Componente Simplificado** (`components/user-payments.tsx`)
- ✅ **Removido** sistema de configuração manual
- ✅ **Usa o novo dashboard** automaticamente
- ✅ **Interface limpa** sem complexidade

## 🎯 Fluxo Automático

1. **Usuário acessa** qualquer página com cobranças
2. **Sistema detecta** automaticamente o `user_id` logado
3. **Busca no Supabase** o `asaas_customer_id` do usuário
4. **Se encontrar**, busca pagamentos na API do Asaas
5. **Exibe dashboard** com todas as informações

## 📊 Funcionalidades

### **Cards de Estatísticas**
- 📈 **Total**: Número total de cobranças
- ⏳ **Pendentes**: Cobranças aguardando pagamento
- ✅ **Pagos**: Cobranças confirmadas
- ❌ **Vencidos**: Cobranças em atraso

### **Resumo Financeiro**
- 💰 **Valor Total**: Soma de todas as cobranças
- 🔄 **Em Aberto**: Valor pendente de pagamento
- ✅ **Recebido**: Valor já pago

### **Lista de Cobranças**
- 🔍 **Detalhes completos** de cada cobrança
- 🏷️ **Status visual** com badges coloridos
- 💳 **Tipo de pagamento** (PIX, Cartão, Boleto)
- 📅 **Datas** de vencimento e pagamento
- 🔗 **Links diretos** para faturas/boletos

### **Status das Cobranças**
- ✅ **Pago** (verde): `RECEIVED`, `CONFIRMED`
- ⏳ **Pendente** (amarelo): `PENDING`, `AWAITING_PAYMENT`
- ❌ **Vencido** (vermelho): `OVERDUE` ou pendente com data passada

## 🔧 Como usar

### **1. Acessar páginas existentes**
- `/perfil` - Dashboard integrado no perfil
- `/minhas-cobrancas` - Página dedicada

### **2. Integrar em outras páginas**
```tsx
import { DashboardCobrancas } from "@/components/dashboard-cobrancas"

export default function MinhaPage() {
  return (
    <div>
      <h1>Minha Página</h1>
      <DashboardCobrancas />
    </div>
  )
}
```

### **3. Usar componente legacy simplificado**
```tsx
import { UserPayments } from "@/components/user-payments"

export default function Page() {
  return <UserPayments userId="..." userEmail="..." />
}
```

## 🛠️ Configuração necessária

### **1. Variáveis de ambiente**
```env
ASAAS_API_KEY=sua_chave_sandbox_ou_producao
```

### **2. Tabela Supabase**
```sql
-- Verificar se a coluna existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'asaas_customer_id';

-- Se não existir, execute:
\i scripts/add-asaas-customer-id-column.sql
```

### **3. Criar customer no Asaas**
- Use a página `/teste-pagamentos` para criar um customer
- Ou use a API diretamente: `POST /api/asaas/customers`

## 🔍 Debug e Monitoramento

### **Logs no Console**
```
🔍 [DASHBOARD-COBRANCAS] Carregando cobranças do usuário...
✅ [DASHBOARD-COBRANCAS] Usuário autenticado: user_id
✅ [DASHBOARD-COBRANCAS] Customer_id encontrado: cus_123456
✅ [DASHBOARD-COBRANCAS] Pagamentos carregados: 5
📊 [DASHBOARD-COBRANCAS] Estatísticas calculadas: {...}
```

### **Verificar dados no banco**
```sql
-- Ver usuários com customer_id
SELECT id, nome_completo, email, asaas_customer_id 
FROM profiles 
WHERE asaas_customer_id IS NOT NULL;

-- Debug completo
\i scripts/debug-asaas-customer-id.sql
```

## 🚨 Troubleshooting

### **"Nenhuma cobrança encontrada"**
1. ✅ Usuário está logado?
2. ✅ Tem `asaas_customer_id` no perfil?
3. ✅ Customer existe no Asaas?
4. ✅ API key está correta?

### **"Erro ao carregar cobranças"**
1. ✅ Verificar logs do console
2. ✅ Testar API manualmente: `/api/asaas/payments/user/CUS_ID`
3. ✅ Verificar conectividade com Asaas

## 🔗 Links Úteis

- **Testar CPF**: `/teste-cpf`
- **Testar Pagamentos**: `/teste-pagamentos`
- **Dashboard**: `/minhas-cobrancas`
- **API Asaas**: [Documentação](https://docs.asaas.com)

---

**Status**: ✅ Implementado e funcionando
**Tipo**: Sistema automático - sem configuração manual
**Benefício**: Interface limpa focada no que importa - as cobranças do usuário 