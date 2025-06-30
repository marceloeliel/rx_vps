-- Script de diagnóstico específico para o problema do customer_id
-- A coluna JÁ EXISTE, então vamos investigar por que não está salvando

-- 1. Confirmar estrutura da coluna
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'asaas_customer_id';

-- 2. Verificar políticas RLS
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Verificar usuários recentes
SELECT 
    id,
    nome_completo,
    email,
    asaas_customer_id,
    created_at
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Teste manual (substitua o ID)
/*
UPDATE profiles 
SET asaas_customer_id = 'cus_test_123'
WHERE id = 'SEU_USER_ID_AQUI';
*/

-- 5. Verificar se RLS está habilitado na tabela
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 6. Buscar usuários recentes que deveriam ter customer_id
SELECT 
    id,
    nome_completo,
    email,
    asaas_customer_id,
    created_at,
    updated_at
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '2 days'
ORDER BY created_at DESC
LIMIT 10;

-- 7. Tentar um update manual de teste (substitua USER_ID_AQUI pelo seu ID)
-- Descomente as linhas abaixo e substitua o ID
/*
UPDATE profiles 
SET 
    asaas_customer_id = 'cus_test_' || extract(epoch from now())::bigint,
    updated_at = NOW()
WHERE id = 'USER_ID_AQUI'; -- Substitua pelo seu user ID

-- Verificar se o update funcionou
SELECT id, asaas_customer_id, updated_at 
FROM profiles 
WHERE id = 'USER_ID_AQUI'; -- Substitua pelo seu user ID
*/

-- 8. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles';

-- 9. Verificar se há triggers que podem estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 10. Testar permissões de auth com função
-- Execute este bloco apenas se estiver logado como usuário autenticado
/*
SELECT auth.uid() as current_user_id;

-- Verificar se consegue fazer select no próprio perfil
SELECT id, asaas_customer_id 
FROM profiles 
WHERE id = auth.uid();
*/ 