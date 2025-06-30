# Solução Rápida: Customer ID não salvando

## 🎯 **Problema Principal**
Customer ID do Asaas não está sendo salvo no Supabase porque:
1. Usuário não existe na tabela `profiles`
2. Formato de telefone inválido

## ⚡ **Solução IMEDIATA**

### Passo 1: Execute no Supabase SQL Editor
```sql
-- 1. Verificar se seu usuário existe na tabela profiles
SELECT * FROM profiles WHERE id = 'SEU_USER_ID_AQUI';

-- 2. Se não existir, criar o perfil
INSERT INTO profiles (
  id, 
  nome_completo, 
  email, 
  created_at, 
  updated_at
) VALUES (
  'SEU_USER_ID_AQUI',
  'Seu Nome Aqui',
  'seu.email@exemplo.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 3. Verificar se a coluna asaas_customer_id existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'asaas_customer_id';

-- 4. Se não existir, criar a coluna
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(50);
```

### Passo 2: Criar Customer sem telefone
Acesse `/debug-customer-id` e use estes dados:

```javascript
// Na função createTestCustomer, remover telefone temporariamente:
const customerData = {
  userId: currentUser.id,
  name: "Teste Customer ID",
  email: currentUser.email,
  cpfCnpj: "11144477735",
  // phone: removido temporariamente
  // mobilePhone: removido temporariamente
  postalCode: "01310100",
  address: "Av. Paulista",
  addressNumber: "1000",
  city: "São Paulo",
  state: "SP",
}
```

### Passo 3: Verificar se funcionou
1. Execute o teste na página `/debug-customer-id`
2. Verifique no console se aparece: "✅ Customer_id salvo no Supabase"
3. Acesse `/minhas-cobrancas` para ver se carrega

## 📞 **Correção do Telefone**

Após resolver o customer_id, teste estes formatos:

### Formatos Válidos para Asaas:
```javascript
// Formato 1: Celular 11 dígitos (mais provável)
phone: "11987654321"
mobilePhone: "11987654321"

// Formato 2: Fixo 10 dígitos  
phone: "1133334444"
mobilePhone: "1133334444"

// Formato 3: Sem DDD (menos provável)
phone: "987654321"
mobilePhone: "987654321"
```

## 🔍 **Validação Final**

Após aplicar a solução:

1. **Verificar no Supabase:**
```sql
SELECT id, nome_completo, asaas_customer_id 
FROM profiles 
WHERE id = 'SEU_USER_ID';
```

2. **Verificar logs no console** ao criar customer
3. **Testar página `/minhas-cobrancas`**

## 🆘 **Se ainda não funcionar**

Execute este SQL para forçar o customer_id:

```sql
-- Força um customer_id de teste
UPDATE profiles 
SET asaas_customer_id = 'cus_000006799464' 
WHERE id = 'SEU_USER_ID';
```

Depois acesse `/minhas-cobrancas` para ver se carrega os pagamentos.

---

**Essencial:** O problema é que o usuário não tem perfil na tabela `profiles`. Criando o perfil, o resto funciona automaticamente! 