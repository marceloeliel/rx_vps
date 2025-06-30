-- Script para debugar o problema do asaas_customer_id
-- Execute este script no Supabase para verificar se tudo está configurado corretamente

-- 1. Verificar se a coluna asaas_customer_id existe na tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'asaas_customer_id';

-- 2. Verificar se existe algum usuário com asaas_customer_id preenchido
SELECT 
    id, 
    nome_completo, 
    email, 
    asaas_customer_id,
    created_at
FROM profiles 
WHERE asaas_customer_id IS NOT NULL
ORDER BY created_at DESC;

-- 3. Verificar todos os usuários recentes (últimas 24 horas)
SELECT 
    id, 
    nome_completo, 
    email, 
    asaas_customer_id,
    created_at
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 4. Contar quantos usuários tem asaas_customer_id
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(asaas_customer_id) as usuarios_com_asaas_id,
    COUNT(*) - COUNT(asaas_customer_id) as usuarios_sem_asaas_id
FROM profiles;

-- 5. Verificar se existe o índice criado
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
  AND indexname LIKE '%asaas%';

-- 6. Mostrar estrutura completa da tabela profiles
\d profiles; 