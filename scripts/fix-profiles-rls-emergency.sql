-- Script de emergência para corrigir problemas de RLS na tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se funcionou
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Remover todas as políticas RLS existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 4. Verificar se as políticas foram removidas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Testar inserção/atualização básica
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Tentar inserir um registro de teste
    INSERT INTO profiles (
        id,
        nome_completo,
        email,
        tipo_usuario,
        perfil_configurado,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'Teste Usuario',
        'teste@email.com',
        'comprador',
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        nome_completo = EXCLUDED.nome_completo,
        updated_at = NOW();
    
    RAISE NOTICE 'Teste de inserção/atualização realizado com sucesso!';
    
    -- Limpar o registro de teste
    DELETE FROM profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'Registro de teste removido com sucesso!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro no teste: %', SQLERRM;
END $$;

-- 6. Mostrar estrutura atual da tabela
\d profiles; 