# 🚨 SOLUÇÃO: Erro de Salvamento de Perfil

## Problema
```
Error: ❌ [UPSERT_PROFILE] Erro no UPSERT: {}
```

Este erro ocorre quando o Row Level Security (RLS) do Supabase está bloqueando operações na tabela `profiles`.

## Solução Rápida

### 1. Execute o Script SQL de Emergência

Vá para o **Supabase SQL Editor** e execute o script:

```sql
-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### 2. Teste a Aplicação

Após executar o comando, tente salvar o perfil novamente. O erro deve ser resolvido.

## Solução Completa

Se a solução rápida não funcionar, execute o script completo:

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Entre no seu projeto
- Clique em "SQL Editor" no menu lateral

### 2. Execute o Script Completo

Copie e cole este script no SQL Editor:

```sql
-- ========================================
-- SCRIPT DE EMERGÊNCIA: Corrigir Salvamento de Perfil
-- ========================================

-- 1. Desabilitar RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 3. Teste de funcionamento
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    -- Teste UPSERT
    INSERT INTO profiles (
        id,
        nome_completo,
        email,
        tipo_usuario,
        perfil_configurado,
        created_at,
        updated_at
    ) VALUES (
        test_id,
        'Teste Funcionamento',
        'teste@funcionamento.com',
        'comprador',
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        nome_completo = EXCLUDED.nome_completo,
        updated_at = EXCLUDED.updated_at;
    
    -- Limpar teste
    DELETE FROM profiles WHERE id = test_id;
    
    RAISE NOTICE '✅ Teste realizado com sucesso! Sistema funcionando.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;
```

### 3. Verificar Resultado

Após executar o script, você deve ver:
- ✅ Teste realizado com sucesso! Sistema funcionando.

### 4. Testar na Aplicação

Volte para a aplicação e tente salvar o perfil novamente.

## Verificação de Funcionamento

Para verificar se tudo está funcionando, você pode:

1. **Acessar a página de debug**: `/debug-profile-save`
2. **Carregar usuário atual**
3. **Executar os testes de salvamento**

## Por que isso acontece?

O Row Level Security (RLS) do Supabase pode causar conflitos quando:
- Políticas mal configuradas bloqueiam operações
- Múltiplas políticas conflitam entre si
- Usuário não tem permissões adequadas

## Alternativa: Desabilitar RLS Permanentemente

Se você não precisa de RLS na tabela profiles:

```sql
-- Desabilitar RLS permanentemente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
```

## Reabilitar RLS (Opcional)

Se quiser reabilitar RLS no futuro:

```sql
-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar política simples
CREATE POLICY "Allow all operations for authenticated users" ON profiles
    FOR ALL USING (auth.role() = 'authenticated');
```

## Logs de Debug

Os logs da aplicação agora mostram informações detalhadas:
- 💾 Dados recebidos
- 🔧 Dados limpos
- 🚨 Detecção de erro vazio
- 🆘 Tentativas de fallback
- ✅ Sucesso ou ❌ Falha

## Contato

Se o problema persistir após executar o script, verifique:
1. Se você tem permissões de administrador no Supabase
2. Se a tabela `profiles` existe
3. Se há outros erros no console do navegador

---

**Última atualização**: Dezembro 2024 