-- SCRIPT COMPLETO PARA RESOLVER O PROBLEMA DO CUSTOMER_ID
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. VERIFICAR SE O USUÁRIO EXISTE
SELECT 
    id, 
    nome_completo, 
    email, 
    whatsapp,
    asaas_customer_id, 
    created_at,
    updated_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- 3. CONTAR USUÁRIOS NA TABELA
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(asaas_customer_id) as usuarios_com_customer_id
FROM profiles;

-- 4. INSERIR OU ATUALIZAR O USUÁRIO (UPSERT ROBUSTO)
INSERT INTO profiles (
    id,
    nome_completo,
    email,
    whatsapp,
    tipo_usuario,
    perfil_configurado,
    asaas_customer_id,
    created_at,
    updated_at
) VALUES (
    '211e066b-c56d-45fc-8504-a98498535693',
    'MARCELO ELIEL DE SOUZA',
    'marcelo@teste.com',
    '61999855068',
    'cliente',
    true,
    'cus_000006799498', -- Customer ID mais recente dos logs
    NOW(),
    NOW()
) 
ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    email = EXCLUDED.email,
    whatsapp = EXCLUDED.whatsapp,
    asaas_customer_id = EXCLUDED.asaas_customer_id,
    updated_at = NOW();

-- 5. VERIFICAR SE FOI INSERIDO/ATUALIZADO
SELECT 
    id, 
    nome_completo, 
    email, 
    whatsapp,
    tipo_usuario,
    asaas_customer_id, 
    created_at,
    updated_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- 6. VERIFICAR POLICIES RLS QUE PODEM ESTAR BLOQUEANDO
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. TESTAR BUSCA PELO CUSTOMER_ID
SELECT 
    id, 
    nome_completo, 
    email,
    asaas_customer_id
FROM profiles 
WHERE asaas_customer_id = 'cus_000006799498';

-- 8. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 9. SE NECESSÁRIO, DESATIVAR RLS TEMPORARIAMENTE PARA TESTE
-- CUIDADO: Execute apenas em ambiente de desenvolvimento!
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 10. MOSTRAR TODOS OS CUSTOMER_IDS ÚNICOS CRIADOS RECENTEMENTE
-- (Para referência de qual usar)
-- Baseado nos logs: cus_000006799489, cus_000006799498 

-- Script para inserir o usuário com customer_id mais recente
-- EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR

-- Inserir ou atualizar o perfil do usuário
INSERT INTO profiles (
  id, 
  nome_completo, 
  email, 
  whatsapp, 
  tipo_usuario,
  perfil_configurado,
  asaas_customer_id, 
  created_at, 
  updated_at
) VALUES (
  '211e066b-c56d-45fc-8504-a98498535693',
  'MARCELO ELIEL DE SOUZA', 
  'marcelo@teste.com', 
  '61999855068',
  'cliente',
  false,
  'cus_000006799511', -- Customer ID mais recente dos logs
  NOW(), 
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  asaas_customer_id = 'cus_000006799511',
  updated_at = NOW();

-- Verificar se foi inserido corretamente
SELECT 
  id,
  nome_completo,
  email,
  whatsapp,
  asaas_customer_id,
  created_at,
  updated_at
FROM profiles 
WHERE id = '211e066b-c56d-45fc-8504-a98498535693';

-- Verificar se existem outros perfis para debug
SELECT 
  id,
  nome_completo,
  email,
  asaas_customer_id,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;