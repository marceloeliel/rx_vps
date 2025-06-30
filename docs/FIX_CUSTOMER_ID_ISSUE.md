# Fix: Customer ID não sendo salvo no Supabase

## Problema Identificado

A cobrança está sendo criada no Asaas, mas não aparece na página `/minhas-cobrancas` porque:

1. **Customer ID não está sendo salvo no Supabase**
2. **Dashboard não encontra pagamentos**

## Diagnóstico dos Logs

- ✅ Pagamento criado no Asaas: `pay_wbrg5lpblho510js`
- ✅ Customer ID gerado: `cus_000006799464` 
- ❌ Customer ID não salvo no Supabase
- ❌ Dashboard não encontra pagamentos

## Solução Rápida

Execute no Supabase SQL Editor:

```sql
-- 1. Verificar se a coluna existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'asaas_customer_id';

-- 2. Se não existir, criar a coluna
ALTER TABLE profiles ADD COLUMN asaas_customer_id VARCHAR(50);

-- 3. Criar índice
CREATE INDEX idx_profiles_asaas_customer_id ON profiles(asaas_customer_id);
```

## Como Testar

1. Acesse `/test-customer-fix`
2. Execute os testes na ordem
3. Verifique os logs no console

## Validação

Após a correção, criar nova cobrança e verificar se aparece em `/minhas-cobrancas`.

## Possíveis Causas

### 1. Coluna `asaas_customer_id` não existe na tabela `profiles`

Execute no SQL Editor do Supabase:

```sql
-- Verificar se a coluna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'asaas_customer_id';
```

**Se não retornar resultado**, execute:

```sql
-- Criar a coluna
ALTER TABLE profiles 
ADD COLUMN asaas_customer_id VARCHAR(50);

-- Criar índice
CREATE INDEX idx_profiles_asaas_customer_id 
ON profiles(asaas_customer_id);
```

### 2. Problemas de RLS (Row Level Security)

Verifique as políticas RLS:

```sql
-- Ver políticas RLS da tabela profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Se necessário, adicione política para update:

```sql
-- Política para permitir update do próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

### 3. Usuário não autenticado no momento da criação

No checkout, verifique se o usuário está logado antes de criar o customer:

```typescript
// Verificar se há usuário logado
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  toast.error("Faça login antes de continuar")
  return
}
```

## Soluções Implementadas

### 1. Logs Melhorados na API

Adicionamos logs detalhados em `/api/asaas/customers/route.ts` para debug:

```typescript
console.log("💾 [CUSTOMERS] UserId:", userId)
console.log("💾 [CUSTOMERS] CustomerId:", data.id)
```

### 2. Função `saveAsaasCustomerId` Melhorada

A função em `lib/supabase/profiles.ts` agora tem:
- Verificação se usuário existe antes do update
- Logs detalhados de erro
- Validação pós-update

### 3. Página de Teste Criada

Nova página `/test-customer-fix` para diagnosticar:
- Verificar se coluna existe
- Testar criação de customer
- Testar salvamento do customer_id
- Testar busca de pagamentos

## Como Testar

1. **Acesse:** `/test-customer-fix`
2. **Execute os testes na ordem:**
   1. Testar Coluna no Banco
   2. Criar Customer  
   3. Criar Pagamento Teste
   4. Buscar Pagamentos

3. **Verifique os logs no console** do navegador

## Como Resolver

### Opção 1: Execute o Script SQL
```sql
-- Execute no Supabase SQL Editor
-- Verifica e cria a coluna se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'asaas_customer_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN asaas_customer_id VARCHAR(50);
        CREATE INDEX idx_profiles_asaas_customer_id ON profiles(asaas_customer_id);
        RAISE NOTICE 'Coluna criada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna já existe!';
    END IF;
END $$;
```

### Opção 2: Use a Página de Teste
1. Acesse `/test-customer-fix`
2. Execute "Testar Coluna no Banco"
3. Se der erro, execute o script SQL acima
4. Tente novamente

### Opção 3: Verificação Manual

Execute no Supabase:

```sql
-- 1. Verificar se existe a coluna
\d profiles

-- 2. Se não existir, criar
ALTER TABLE profiles ADD COLUMN asaas_customer_id VARCHAR(50);

-- 3. Testar um update manual
UPDATE profiles 
SET asaas_customer_id = 'cus_test_123' 
WHERE id = 'SEU_USER_ID_AQUI';

-- 4. Verificar se foi salvo
SELECT id, asaas_customer_id FROM profiles WHERE asaas_customer_id IS NOT NULL;
```

## Validação Final

Após a correção:

1. **Criar nova cobrança no checkout**
2. **Verificar logs no console** - deve mostrar customer_id sendo salvo
3. **Acessar `/minhas-cobrancas`** - deve exibir a cobrança
4. **Verificar no Supabase** - tabela `profiles` deve ter `asaas_customer_id` preenchido

## Prevenção

Para evitar o problema no futuro:

1. **Sempre incluir `userId` ao criar customers**
2. **Verificar logs de salvamento**
3. **Testar fluxo completo após mudanças**
4. **Manter backups dos scripts SQL**

---

**Status:** ✅ Correções implementadas  
**Testes:** Disponível em `/test-customer-fix`  
**Scripts:** `scripts/verify-asaas-customer-id-column.sql` 