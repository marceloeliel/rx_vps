# Sistema de Customer ID - Integração Supabase + Asaas

## Visão Geral

Este sistema implementa uma integração inteligente entre Supabase e Asaas, salvando o `customer_id` do Asaas no perfil do usuário no Supabase para facilitar buscas e evitar duplicatas.

## Problema Resolvido

**Antes:** 
- Busca de pagamentos por email era lenta e imprecisa
- Criação de customers duplicados
- Necessidade de filtrar todos os pagamentos manualmente

**Depois:**
- Busca direta por `customer_id` específico
- Reutilização de customers existentes
- Performance muito melhor
- Evita duplicatas automaticamente

## Arquitetura

### 1. Banco de Dados (Supabase)

#### Tabela `profiles`
```sql
-- Nova coluna adicionada
ALTER TABLE profiles 
ADD COLUMN asaas_customer_id VARCHAR(50);

-- Índice para performance
CREATE INDEX idx_profiles_asaas_customer_id 
ON profiles(asaas_customer_id);
```

### 2. Funções no Supabase (`lib/supabase/profiles.ts`)

```typescript
// Salvar customer_id do Asaas no perfil
export async function saveAsaasCustomerId(
  userId: string,
  asaasCustomerId: string
): Promise<boolean>

// Buscar customer_id do Asaas do usuário
export async function getAsaasCustomerId(userId: string): Promise<string | null>

// Buscar usuário pelo customer_id do Asaas
export async function getUserByAsaasCustomerId(asaasCustomerId: string): Promise<UserProfile | null>
```

### 3. API de Customers (`app/api/asaas/customers/route.ts`)

#### Fluxo Inteligente:
1. **Verificação:** Se `userId` é fornecido, busca customer_id existente no Supabase
2. **Reutilização:** Se encontrado, retorna customer existente do Asaas
3. **Criação:** Se não encontrado, cria novo customer no Asaas
4. **Salvamento:** Salva automaticamente o customer_id no Supabase

```typescript
// Exemplo de uso
const response = await fetch("/api/asaas/customers", {
  method: "POST",
  body: JSON.stringify({
    name: "João Silva",
    email: "joao@email.com",
    cpfCnpj: "12345678901",
    userId: "user-uuid", // ← Chave para o sistema inteligente
  }),
})
```

### 4. API de Pagamentos do Usuário (`app/api/asaas/payments/user/[userId]/route.ts`)

#### Busca Otimizada:
1. **Busca Local:** Primeiro busca o `customer_id` no Supabase
2. **Busca Direta:** Usa o customer_id para buscar pagamentos específicos no Asaas
3. **Performance:** Muito mais rápido que filtrar por email

```typescript
// URL da API otimizada
const paymentsUrl = `${ASAAS_API_URL}/payments?customer=${asaasCustomerId}&limit=${limit}`
```

## Implementação

### 1. Executar Script SQL

```sql
-- Execute no Supabase SQL Editor
-- scripts/add-asaas-customer-id-column.sql
```

### 2. Atualizar Checkout

```typescript
// app/checkout/page.tsx
const customerData = {
  name: formData.nomeCompleto,
  email: formData.email,
  cpfCnpj: formData.cpf.replace(/\D/g, ""),
  userId: currentUser?.id, // ← Incluir userId
}
```

### 3. Hook Atualizado

```typescript
// hooks/use-asaas.ts
interface AsaasCustomer {
  // ... outros campos
  userId?: string // ← Novo campo opcional
}

const { getOrCreateCustomer } = useAsaas() // ← Nova função
```

## Vantagens

### ✅ Performance
- **Antes:** Buscar 100+ customers → filtrar por email → buscar pagamentos
- **Depois:** Buscar direto por customer_id específico

### ✅ Precisão
- **Antes:** Filtro por email pode ter falsos positivos
- **Depois:** Busca exata por ID único

### ✅ Economia
- **Antes:** Múltiplas requisições e processamento
- **Depois:** Requisição direta e específica

### ✅ Evita Duplicatas
- **Antes:** Criava novo customer a cada pagamento
- **Depois:** Reutiliza customer existente automaticamente

### ✅ Manutenibilidade
- **Antes:** Lógica complexa de filtros
- **Depois:** Busca simples e direta

## Testes

### Página de Teste Específica
- **URL:** `/teste-customer-system`
- **Funcionalidades:**
  - Status do usuário logado
  - Criar/buscar customer automaticamente
  - Criar pagamento teste
  - Visualizar estatísticas em tempo real
  - Listar últimos pagamentos

### Casos de Teste

1. **Usuário Novo:**
   - Cria customer no Asaas
   - Salva customer_id no Supabase
   - Próximos pagamentos reutilizam o mesmo customer

2. **Usuário Existente:**
   - Busca customer_id no Supabase
   - Retorna customer existente do Asaas
   - Não cria duplicatas

3. **Busca de Pagamentos:**
   - Usa customer_id para busca direta
   - Performance muito superior
   - Resultados precisos

## Monitoramento

### Logs do Sistema
```
🚀 [CUSTOMERS] Verificando customer existente para userId: xxx
✅ [CUSTOMERS] Customer já existe: cus_000006799258
💾 [CUSTOMERS] Salvando customer_id no Supabase...
✅ [USER-PAYMENTS] Customer_id encontrado: cus_000006799258
```

### Métricas Importantes
- **Reutilização de Customers:** % de customers reutilizados vs novos
- **Performance:** Tempo de resposta das buscas
- **Precisão:** Pagamentos encontrados vs esperados

## Migração

### Para Usuários Existentes
1. **Opção 1:** Executar script de migração para associar customers existentes
2. **Opção 2:** Deixar o sistema criar associações conforme necessário
3. **Opção 3:** Interface administrativa para associar manualmente

### Script de Migração (Futuro)
```sql
-- Associar customers existentes por email
UPDATE profiles 
SET asaas_customer_id = (
  SELECT customer_id FROM asaas_customers 
  WHERE email = profiles.email
)
WHERE asaas_customer_id IS NULL;
```

## Segurança

### Validações
- ✅ Verificar se usuário está logado
- ✅ Validar ownership do customer_id
- ✅ Sanitizar dados de entrada
- ✅ Rate limiting nas APIs

### Permissões
- ✅ Usuário só acessa seus próprios pagamentos
- ✅ Customer_id associado apenas ao usuário correto
- ✅ RLS (Row Level Security) no Supabase

## Próximos Passos

1. **Implementar em Produção:**
   - Executar script SQL
   - Atualizar variáveis de ambiente
   - Monitorar logs

2. **Otimizações Futuras:**
   - Cache de customer_ids
   - Sync automático com webhooks
   - Dashboard de métricas

3. **Funcionalidades Adicionais:**
   - Histórico de customers
   - Relatórios de performance
   - Interface de administração

## Conclusão

Este sistema resolve definitivamente o problema de performance e precisão na busca de pagamentos, implementando uma solução elegante e eficiente que:

- **Melhora drasticamente a performance**
- **Elimina duplicatas de customers**
- **Simplifica a arquitetura**
- **Facilita manutenção futura**
- **Melhora a experiência do usuário**

O sistema está pronto para produção e pode ser expandido conforme necessário. 