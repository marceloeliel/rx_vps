-- Script para debugar problemas na tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Verificar se há dados na tabela
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN asaas_customer_id IS NOT NULL THEN 1 END) as with_customer_id,
    COUNT(CASE WHEN nome_completo IS NOT NULL THEN 1 END) as with_name
FROM profiles;

-- 5. Verificar constraints e índices
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    confupdtype,
    confdeltype
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 6. Verificar se há triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 7. Testar inserção simples (comentado para segurança)
/*
INSERT INTO profiles (
    id,
    nome_completo,
    email,
    created_at,
    updated_at
) VALUES (
    'test-user-id-123',
    'Teste Usuario',
    'teste@email.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();
*/

-- 8. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles'; 