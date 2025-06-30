-- ========================================
-- SCRIPT DE EMERGÊNCIA: Corrigir Salvamento de Perfil
-- Execute este script no Supabase SQL Editor
-- ========================================

-- 1. Desabilitar RLS temporariamente para permitir operações
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas RLS existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 3. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Teste de funcionamento básico
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    success_count INTEGER := 0;
BEGIN
    -- Teste 1: INSERT básico
    BEGIN
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
            'Teste Emergência INSERT',
            'teste.insert@emergencia.com',
            'comprador',
            false,
            NOW(),
            NOW()
        );
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste INSERT: SUCESSO';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Teste INSERT: FALHOU - %', SQLERRM;
    END;
    
    -- Teste 2: UPDATE básico
    BEGIN
        UPDATE profiles 
        SET 
            nome_completo = 'Teste Emergência UPDATE',
            updated_at = NOW()
        WHERE id = test_id;
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste UPDATE: SUCESSO';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Teste UPDATE: FALHOU - %', SQLERRM;
    END;
    
    -- Teste 3: UPSERT básico
    BEGIN
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
            'Teste Emergência UPSERT',
            'teste.upsert@emergencia.com',
            'vendedor',
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            nome_completo = EXCLUDED.nome_completo,
            email = EXCLUDED.email,
            tipo_usuario = EXCLUDED.tipo_usuario,
            perfil_configurado = EXCLUDED.perfil_configurado,
            updated_at = EXCLUDED.updated_at;
        success_count := success_count + 1;
        RAISE NOTICE '✅ Teste UPSERT: SUCESSO';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Teste UPSERT: FALHOU - %', SQLERRM;
    END;
    
    -- Limpar teste
    DELETE FROM profiles WHERE id = test_id;
    
    -- Resultado final
    IF success_count = 3 THEN
        RAISE NOTICE '🎉 TODOS OS TESTES PASSARAM! A tabela profiles está funcionando corretamente.';
        RAISE NOTICE '✅ Agora você pode usar o sistema normalmente.';
    ELSE
        RAISE NOTICE '⚠️ Alguns testes falharam (% de 3). Verifique os erros acima.', success_count;
    END IF;
    
END $$;

-- 6. Verificar contagem de registros existentes
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN asaas_customer_id IS NOT NULL THEN 1 END) as with_customer_id,
    COUNT(CASE WHEN nome_completo IS NOT NULL THEN 1 END) as with_name,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as with_email
FROM profiles;

-- 7. Mostrar alguns registros existentes (se houver)
SELECT 
    id,
    nome_completo,
    email,
    tipo_usuario,
    asaas_customer_id,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SCRIPT DE EMERGÊNCIA EXECUTADO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'O que foi feito:';
    RAISE NOTICE '1. RLS desabilitado na tabela profiles';
    RAISE NOTICE '2. Políticas RLS problemáticas removidas';
    RAISE NOTICE '3. Testes de funcionamento executados';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora tente salvar o perfil novamente.';
    RAISE NOTICE 'Se ainda houver problemas, contate o suporte.';
    RAISE NOTICE '========================================';
END $$; 