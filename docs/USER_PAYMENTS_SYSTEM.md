# Sistema de Pagamentos do Usuário - Integração Asaas

## 📋 Visão Geral

Sistema completo para gerenciar cobranças de usuários integrado com o Asaas, incluindo verificação de pendências e bloqueio de novas cobranças.

## 🏗️ Arquitetura

### APIs Criadas

1. **`/api/asaas/payments/user/[userId]`** - Busca pagamentos de um usuário
2. **`/api/asaas/customers/list`** - Lista todos os customers do Asaas

### Componentes

1. **`UserPayments`** - Interface completa para exibir cobranças
2. **`useUserPayments`** - Hook para gerenciar estado dos pagamentos

### Páginas Atualizadas

1. **`/perfil`** - Exibe cobranças do usuário
2. **`/checkout`** - Verifica pendências antes de processar
3. **`/teste-user-payments`** - Página de testes

## 🔧 Funcionalidades

### ✅ Verificação de Pendências
- Bloqueia criação de novas cobranças se há pendências
- Alerta visual no checkout
- Botão desabilitado com feedback

### ✅ Exibição de Cobranças
- Resumo visual (total, pendentes, pagas)
- Lista detalhada com status coloridos
- Ações específicas por tipo (PIX, Boleto, Cartão)
- Links para faturas e comprovantes

### ✅ Estados dos Pagamentos
- **PENDING/AWAITING_PAYMENT**: Pendente (bloqueia)
- **CONFIRMED/RECEIVED**: Pago (permite)
- **OVERDUE**: Vencido (bloqueia)

## 🚀 Como Usar

### 1. No Perfil do Usuário
```tsx
import { UserPayments } from "@/components/user-payments"

// Na página de perfil
{user && profile?.email && (
  <UserPayments userId={user.id} userEmail={profile.email} />
)}
```

### 2. Verificar Pendências
```tsx
import { useUserPayments } from "@/hooks/use-user-payments"

const { hasPendingPayments, checkPendingPayments } = useUserPayments(userId, email)

// Antes de processar pagamento
if (hasPendingPayments) {
  // Bloquear ação
  return
}
```

### 3. API Direta
```javascript
// Buscar pagamentos do usuário
const response = await fetch(`/api/asaas/payments/user/${userId}?email=${email}`)
const data = await response.json()

console.log("Tem pendências:", data.hasPendingPayments)
console.log("Total:", data.totalPayments)
console.log("Pendentes:", data.pendingPayments)
```

## 🧪 Como Testar

### 1. Página de Teste
Acesse: `http://localhost:3000/teste-user-payments`

### 2. Fluxo Completo
1. **Carregar customers** disponíveis
2. **Selecionar um email** de customer existente
3. **Testar API** diretamente
4. **Criar pagamento** via `/teste-pagamentos`
5. **Verificar no perfil** (`/perfil`)
6. **Testar bloqueio** no checkout (`/checkout?plano=basico`)

### 3. Emails de Teste Disponíveis
- `jeff@te.com` (tem pagamentos)
- `joao.teste@email.com` (pode ter pagamentos)
- Outros conforme customers criados

## 🔍 Logs e Debug

### Console Logs
```
🚀 [USER-PAYMENTS] Iniciando GET para usuário: xxx
🔑 [USER-PAYMENTS] Verificando token...
✅ [USER-PAYMENTS] Token encontrado
👤 [USER-PAYMENTS] Buscando customer no Asaas...
💰 [USER-PAYMENTS] Buscando pagamentos...
🔍 [USER-PAYMENTS] Filtrando por email: xxx
✅ [USER-PAYMENTS] Pagamentos encontrados: X
```

### Estados do Hook
- `loading`: Carregando dados
- `error`: Mensagem de erro
- `hasPendingPayments`: Boolean se tem pendências
- `totalPayments`: Número total de pagamentos
- `pendingCount`: Número de pendentes

## 🚨 Pontos de Atenção

### 1. Correspondência de Email
- O email do usuário deve corresponder ao email do customer no Asaas
- Se não houver correspondência, não encontrará pagamentos

### 2. Token do Asaas
- Atualmente usando token hardcoded (temporário)
- Em produção, usar apenas variável de ambiente

### 3. Performance
- API busca todos os pagamentos e filtra localmente
- Para muitos pagamentos, considerar paginação

## 🔄 Próximos Passos

1. **Webhook Asaas**: Atualização automática de status
2. **Cache**: Redis/Supabase para performance
3. **Notificações**: Email/SMS para vencimentos
4. **Relatórios**: Dashboard de métricas
5. **Testes**: Unit tests automatizados

## 📝 Exemplo de Uso Completo

```tsx
import { UserPayments } from "@/components/user-payments"
import { useUserPayments } from "@/hooks/use-user-payments"

export default function MinhaPagina() {
  const { hasPendingPayments, pendingCount } = useUserPayments(userId, email)
  
  const handleAction = async () => {
    if (hasPendingPayments) {
      alert(`Você tem ${pendingCount} cobrança(s) pendente(s)`)
      return
    }
    
    // Prosseguir com ação
  }
  
  return (
    <div>
      {hasPendingPayments && (
        <Alert>Você possui cobranças pendentes</Alert>
      )}
      
      <UserPayments userId={userId} userEmail={email} />
      
      <Button 
        onClick={handleAction}
        disabled={hasPendingPayments}
      >
        Nova Cobrança
      </Button>
    </div>
  )
}
```

---

Sistema implementado e funcionando! 🎉 